/**
 * When serialise, vectors are objects in lua rather than arrays
 */
export interface sc_script_vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Defines the parameters that initialise a template
 */
export interface sc_script_marker_template {
  name: string;
  color: string;
  type: string;
  orientation: sc_script_vec3;
  position: sc_script_vec3;
  prop: string;
  resource?: boolean;
  amount?: number;
  editorIcon?: string;
  size?: number;
  hint?: boolean;
}

/**
 * Script marker. Represents a 'thing' in the map - spawn point,
 * mass, hydrocarbon etc.
 * Does not represent wreckage.
 *
 * Valid types: 'Blank Marker': Spawn point
 *              'Mass': Mass point
 *              'Hydrocarbon': Hydrocarbon point
 *              'Defensive point': AI marker
 *              'Combat Zone': AI marker
 *              'Expansion Area': AI marker
 *              'Rally Point': AI marker
 *              'Protected Experimental Construction': AI marker
 */
export class sc_script_marker implements sc_script_marker_template {
  private __name: string;
  private __color: string;
  private __type: string;
  private __orientation: sc_script_vec3;
  private __position: sc_script_vec3;
  private __prop: string;
  private __resource: boolean | undefined;
  private __amount: number | undefined;
  private __editorIcon: string | undefined;
  private __size: number | undefined;
  private __hint: boolean | undefined;
  // Used for editor only
  public selected: boolean | undefined;

  public constructor(name: string,
                     input: sc_script_marker_template) {
    // Common fields
    this.__name = name;
    this.__color = input.color;
    this.__type = input.type;
    this.__orientation = {...input.orientation};
    this.__position = {...input.position};
    this.__prop = input.prop;

    // Uncommon fields
    // I can't just load all keys as I would lose type information, so instead I'm going to labouriously curate the
    // possible attributes
    // If these are not present then the corresponding getter will return undefined
    this.__resource = input.resource;
    this.__amount = input.amount;
    this.__editorIcon = input.editorIcon;
    this.__size = input.size;
    this.__hint = input.hint;
  }

  public get name(): string { return this.__name; }
  public get color(): string { return this.__color; }
  public get type(): string { return this.__type; }
  public get orientation(): sc_script_vec3 { return this.__orientation; }
  public get position(): sc_script_vec3 { return this.__position; }
  public get prop(): string { return this.__prop; }
  public get resource(): boolean | undefined { return this.__resource; }
  public get amount(): number | undefined { return this.__amount; }
  public get editorIcon(): string | undefined { return this.__editorIcon; }
  public get size(): number | undefined{ return this.__size; }
  public get hint(): boolean | undefined { return this.__hint; }


  public save(): string {

    // Save common fields
    let output =
    `        ['${this.__name}'] ={\n`                                                                                     +
    `          ['color'] = STRING( '${this.__color}' ),\n`                                                                +
    `          ['type'] = STRING( '${this.__type}' ),\n`                                                                  +
    `          ['orientation'] = VECTOR3( ${this.__orientation.x}, ${this.__orientation.y}, ${this.__orientation.z} ),\n` +
    `          ['position'] = VECTOR3( ${this.__position.x}, ${this.__position.y}, ${this.__position.z} ),\n`             +
    `          ['prop'] = STRING( '${this.__prop}' ),\n`;

    // Save uncommon fields
    if (this.__resource !== undefined) {
      output = output + `          ['resource'] = BOOLEAN( ${this.__resource ? 'true' : 'false'} ),\n`;
    }
    if (this.__amount !== undefined) {
      output = output + `          ['amount'] = FLOAT( ${this.__amount} ),\n`;
    }
    if (this.__editorIcon !== undefined) {
      output = output + `          ['editorIcon'] = STRING( '${this.__editorIcon}' ),\n`;
    }
    if (this.__size !== undefined) {
      output = output + `          ['size'] = FLOAT( ${this.__size} ),\n`;
    }
    if (this.__hint !== undefined) {
      output = output + `          ['hint'] = BOOLEAN( ${this.__hint ? 'true' : 'false'} ),\n`;
    }

    output = output +
    `        },\n`;

    return output;
  }


  /**
   * Given a list of markers, and a marker type, finds a unique name for that type of marker
   * eg (["mass_1", "mass_2", "mass_3"], "mass_1") => "mass_4"
   * eg (["mass_1", "mass_2", "mass_3"], "mass")   => "mass_4"
   */
  public static find_unique_name(markers: sc_script_marker[], marker_type_or_name: string) {
    const marker_names = markers.map(marker => marker.name);

    // Determine name of new marker by stripping the trailing number
    const match = /(.+)_[0-9]+/.exec(marker_type_or_name);
    let marker_name_stem;
    if (match) {
      marker_name_stem = match[1];
    } else {
      marker_name_stem = marker_type_or_name;
    }

    // Dumb linear search for first free index.
    // Fine for small N, which is what we have
    let marker_name;
    for (let i = 0;; i++) {
      const candidate_marker_name = `${marker_name_stem}_${i}`;
      if (marker_names.find(name => name === candidate_marker_name) == null) {
        marker_name = candidate_marker_name;
        break;
      }
    }

    return marker_name;
  }
}
