import { People, Relations, toHashtable, descendants} from "./person_table";
import { ph_lookup } from "../lib/hashtables";
import { list, pair } from "../lib/list";



test('Empty lists give empty hashtable', () => {
    const test_ht = toHashtable(list(), list());

    expect(test_ht.keys).toStrictEqual([]);
    expect(test_ht.entries).toBe(0);
    expect(test_ht.values).toStrictEqual([]);
    });

test('Empty relations list give empty relation arrays', () => {
    const people: People = list(pair(2000_0000_0000, "person1"),
                                pair(2001_0000_0000, "person2"),
                                pair(2002_0000_0000, "person3"));

    const test_ht = toHashtable(people, list());
    
    expect(ph_lookup(test_ht, 2000_0000_0000)?.children).toStrictEqual([]);
    expect(ph_lookup(test_ht, 2000_0000_0000)?.parents).toStrictEqual([]);

    expect(ph_lookup(test_ht, 2001_0000_0000)?.children).toStrictEqual([]);
    expect(ph_lookup(test_ht, 2001_0000_0000)?.parents).toStrictEqual([]);

    expect(ph_lookup(test_ht, 2002_0000_0000)?.children).toStrictEqual([]);
    expect(ph_lookup(test_ht, 2002_0000_0000)?.parents).toStrictEqual([]);
});

test('Names and parent and children arrays are correct', () => {
    const people: People = list(pair(1969_0000_0000, "mamma"),
                                pair(1968_0000_0000, "pappa"),
                                pair(2002_0000_0000, "person"),
                                pair(2030_0000_0000, "barn"));

    const relations: Relations = list(pair(1969_0000_0000,2002_0000_0000),
                                      pair(1968_0000_0000,2002_0000_0000),
                                      pair(2002_0000_0000,2030_0000_0000));

    const test_ht = toHashtable(people,relations);

    const lookup_middle_person = ph_lookup(test_ht, 2002_0000_0000);
    expect(lookup_middle_person?.children).toStrictEqual([2030_0000_0000]);
    expect(lookup_middle_person?.parents).toContain(1969_0000_0000);
    expect(lookup_middle_person?.parents).toContain(1968_0000_0000);
    expect(lookup_middle_person?.parents.length).toBe(2);
    expect(lookup_middle_person?.name).toBe("person");

    const lookup_child = ph_lookup(test_ht, 2030_0000_0000);
    expect(lookup_child?.children).toStrictEqual([]);
    expect(lookup_child?.parents).toStrictEqual([2002_0000_0000]);
    expect(lookup_child?.name).toBe("barn");

    const lookup_parent = ph_lookup(test_ht, 1969_0000_0000);
    expect(lookup_parent?.parents).toStrictEqual([]);
    expect(lookup_parent?.children).toStrictEqual([2002_0000_0000])
    expect(lookup_parent?.name).toBe("mamma");
});

test('Adding duplicate relations', () => {
    const people: People = list(pair(2000_0000_0000, "person"),
                                pair(2030_0000_0000, "barn"));
    const relations: Relations = list(pair(2000_0000_0000, 2030_0000_0000),
                                      pair(2000_0000_0000, 2030_0000_0000),
                                      pair(2000_0000_0000, 2030_0000_0000));
    const test_ht = toHashtable(people, relations);
    
    expect(ph_lookup(test_ht, 2000_0000_0000)?.children).toStrictEqual([2030_0000_0000]);
    expect(ph_lookup(test_ht, 2030_0000_0000)?.parents).toStrictEqual([2000_0000_0000]);
});

test('Same id added twice', () => {
    //when persons with the same id
    //is added multiple times, the name of the last 
    //of them in the list will be kept. The relations
    //does only depend on the id so will be the same
    const people: People = list(pair(2000_0000_0000, "person1"),
                                pair(2000_0000_0000, "person2"));
    const test_ht = toHashtable(people, list());
    const lookup = ph_lookup(test_ht, 2000_0000_0000);

    expect(lookup?.name).toBe("person2");

});

//////////////////////////////

test('Returns undefined when id is not in hashtable', () => {
    const test_ht = toHashtable(list(), list());

    //not in ht
    expect(descendants(test_ht, 1000_0000_0000)).toBe(undefined);
});

test('Returns empty array when no descendants', () => {
    const test_ht = toHashtable(list(pair(2000_0000_0000, "person")), list());

    expect(descendants(test_ht, 2000_0000_0000)).toStrictEqual([]);
});

test('One descendant', () => {
    const people: People = list(pair(1970_0000_0000, "gen1"),
                                pair(2000_0000_0000, "gen2"),
                                pair(2030_0000_0000, "gen3"),
                                pair(2060_0000_0000, "gen4"));
    const relations: Relations = list(pair(1970_0000_0000, 2000_0000_0000),
                                      pair(2030_0000_0000, 2060_0000_0000));
    const test_ht = toHashtable(people, relations);

    expect(descendants(test_ht, 1970_0000_0000)).toStrictEqual([2000_0000_0000]);
    expect(descendants(test_ht, 2030_0000_0000)).toStrictEqual([2060_0000_0000]);
});

test('Multi-level descendants', () => {
    const people: People = list(pair(1970_0000_0000, "gen1"),
                                pair(2000_0000_0000, "gen2"),
                                pair(2030_0000_0000, "gen3"),
                                pair(2060_0000_0000, "gen4"));
    const relations: Relations = list(pair(1970_0000_0000, 2000_0000_0000),
                                      pair(2000_0000_0000, 2030_0000_0000),
                                      pair(2030_0000_0000, 2060_0000_0000));
    const test_ht = toHashtable(people, relations);
    const test_descendants = descendants(test_ht, 1970_0000_0000);

    expect(test_descendants).toContain(2000_0000_0000);
    expect(test_descendants).toContain(2030_0000_0000);
    expect(test_descendants).toContain(2060_0000_0000);
    expect(test_descendants?.length).toBe(3);
});

test('Do not add duplicate elements', () => {
    const people: People = list(pair(1950_0000_0000, "parent"),
                                pair(1980_0000_0000, "child1"),
                                pair(1981_0000_0000, "child2"),
                                pair(2000_0000_0000, "baby"));
    const relations: Relations = list(pair(1950_0000_0000, 1980_0000_0000),
                                      pair(1950_0000_0000, 1981_0000_0000),
                                      pair(1980_0000_0000, 2000_0000_0000),
                                      pair(1981_0000_0000, 2000_0000_0000));
    const test_ht = toHashtable(people, relations);

    expect(descendants(test_ht, 1950_0000_0000)?.length).toBe(3);
    expect(descendants(test_ht, 1950_0000_0000)).toContain(1980_0000_0000);
    expect(descendants(test_ht, 1950_0000_0000)).toContain(1981_0000_0000);
    expect(descendants(test_ht, 1950_0000_0000)).toContain(2000_0000_0000);
});

