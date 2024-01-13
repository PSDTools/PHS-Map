/**
 * Represent a level of the school.
 */
type Lvl = Lvl0 | Lvl1 | Lvl2;

/**
 * Represent the basement, which includes the band room and the choir room.
 */
type Lvl0 = 0;

/**
 * Represent the first floor.
 */
type Lvl1 = 1;

/**
 * Represent the second floor.
 */
type Lvl2 = 2;

/**
 * Represent the stairs.
 */
type StairList = Record<`${number}`, Coords2D>;

/**
 * Represent coordinates for stairs.
 */
type Coords2D = readonly [number, number];

/**
 * Represent coordinates for rooms.
 */
type Coords = readonly [number, number, number];

/**
 * Represent a valid, though not necessarily existing, room number.
 */
type Rooms = Record<`${Wing}${Lvl}${number}${number}`, Coords>;

/**
 * Represent the level data.
 */
// TODO(ParkerH27): Use a Set here.
type Level = number[][];

/**
 * The wings of the school.
 */
type Wing = AWing | BWing | CWing | DWing | EWing | FWing | GWing | HWing;

/**
 * Represent the "A" wing.
 *
 * The "A" wing is also known colloquy as "The Bridge".
 * It has music and communication arts.
 */
type AWing = "A";

/**
 * Represent the "B" wing.
 *
 * The "B" wing has business and technology.
 */
type BWing = "B";

/**
 * Represent the "C" wing.
 *
 * The "C" wing is sometimes believed to be mythical.
 * Its contents are unknown.
 */
type CWing = "C";

/**
 * Represent the "D" wing.
 *
 * The "D" wing has history and english.
 */
type DWing = "D";

/**
 * Represent the "E" wing.
 *
 * The "E" wing has family and consumer sciences and the cafeteria.
 */
type EWing = "E";

/**
 * Represent the "F" wing.
 *
 * The "F" wing has the sciences.
 */
type FWing = "F";

/**
 * Represent the "G" wing.
 *
 * The "G" wing has health, art, and positive school.
 */
type GWing = "G";

/**
 * Represent the "H" wing.
 *
 * The "H" wing has math and modern language.
 */
type HWing = "H";

export type { Coords, Coords2D, Level, Lvl, StairList, Wing, Rooms };
