// extend imports as needed
import { Pair, List, head, tail, pair, is_null, length } from '../lib/list';
import { ProbingHashtable, ph_empty, ph_insert, ph_lookup} from '../lib/hashtables';

/* DO NOT MODIFY these type declarations */
export type People = List<Pair<number,string>>;
export type Relations = List<Pair<number,number>>;
export type Person = {
    id: number, // the identifier as described above
    name: string,
    parents: Array<number>,
    children: Array<number>
};
export type PersonTable = ProbingHashtable<number,Person>;
/* End of type declarations */


/**
 * Create a hash table of Person records based on given relations.
 * @precondition All ids appearing in relations are in the people list.
 * @param people peoples ids and names
 * @param relations parent-child relations
 * @return Returns a hash table with a Person record for each person from people
 *     that includes all relationships according relations.
 */
export function toHashtable(people: People, relations: Relations): PersonTable {
    const table: PersonTable = ph_empty(length(people), (x:number) => x);
    while(!is_null(people)){
        const id = head(head(people));
        const name = tail(head(people));
        const person_relations = get_relations(id, relations);
        const new_person = {
            id: id,
            name: name,
            parents: person_relations[0],
            children: person_relations[1]
        };
        ph_insert(table, id, new_person);
        people = tail(people);
    }
    return table;
}

/**
 * Create parent and children arrays, given a person id and relations.
 * @precondition All ids appearing in relations are in the people list.
 * @param id person to get relations from
 * @param relations parent-child relations
 * @return Returns a tuple of two arrays containing the parents and children ids.
 */
function get_relations(id: number, relations: Relations): [Array<number>, Array<number>]{
    const parents: Array<number> = [];
    const children: Array<number> = [];
    while(!is_null(relations)) {
        const parent: number = head(head(relations));
        const child: number = tail(head(relations));
        if(parent === id && !children.includes(child)) {
            children.push(child);
        }
        else if(child === id && !parents.includes(parent)) {
            parents.push(parent);
        } else {}
        relations = tail(relations);
    }
    return [parents, children];
}

/**
 * Computes the descendants of a person.
 * @param ht Relationships of people
 * @param id Identification number of the person to compute the descendants for
 * @returns Returns all the descendants of the person with ID id, according to
 *     the relationships in ht, or undefined if the person with ID is is not
 *     found in ht.
 */
export function descendants(ht: PersonTable, id: number): Array<number> | undefined {
    function helper(current: Array<number>, children: Array<number>): Array<number> {
        const new_arr: Array<number> = [];
        for(let i = 0; i < children.length; i = i + 1){
            const new_children = ph_lookup(ht, children[i])?.children;
            if(new_children !== undefined) {
                for(let j = 0; j < new_children.length; j = j + 1){
                    if(new_arr.includes(new_children[j]) || current.includes(new_children[j])){
                        continue;
                    }
                    new_arr.push(new_children[j]);
                }
                current.push(children[i]);
            } else {}
        }
        if(new_arr.length === 0){
            return current;
        } else {
            return helper(current, new_arr);
        }
    }
    const first_children = ph_lookup(ht, id)?.children;
    return first_children === undefined ? undefined : helper([], first_children);

}


