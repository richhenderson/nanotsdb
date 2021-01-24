interface DatabaseConfig {
  /*
	 * Path to the database file.
	*/
  filePath: string;
}

export class NanoTsDb {
  private _data: Record<string, unknown>[] = [];
  private _connected = false;
  private config: DatabaseConfig = {
    filePath: `${Deno.cwd()}/db.json`,
  };

  constructor(config?: DatabaseConfig) {
    if (typeof config !== "undefined") {
      this.config = { ...this.config, ...config };
    }
  }

  /* ===== PRIVATE ===== */

  private findIndexBy(ob: Record<string, unknown>) {
    return this._data.findIndex((x) => this.partialContains(x, ob));
  }

  private findDataBy(ob: Record<string, unknown>) {
    return this._data.find((object) => this.partialContains(object, ob));
  }

  private findAllDataBy(ob: Record<string, unknown>) {
    return this._data.filter((object) => this.partialContains(object, ob));
  }

  private partialContains(
    object: Record<string, unknown>,
    subObject: Record<string, unknown>,
  ): boolean {
    // Create arrays of property names
    const objProps = Object.getOwnPropertyNames(object);
    const subProps = Object.getOwnPropertyNames(subObject);

    if (subProps.length > objProps.length) return false;

    for (const subProp of subProps) {
      if (
        !Object.prototype.hasOwnProperty.call(object, subProp) ||
        object[subProp] !== subObject[subProp]
      ) {
        return false;
      }
    }

    return true;
  }

  /* ===== PUBLIC ===== */

  async connect() {
    if (this._connected) {
      return true;
    }
    /*
      * Check if there is a database. Otherwise, create one.
    */
    try {
      await Deno.lstat(this.config.filePath);
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        this._data = [];
        await this.save();
        console.log(`File created: ${this.config.filePath}`);
      } else throw err;
    }

    /*
      * Read database file
    */
    this._data = await JSON.parse(
      await Deno.readTextFile(this.config.filePath),
    );
    this._connected = true;
    console.log(`DB Connected: ${this.config.filePath}`);
    return this._connected;
  }

  async save() {
    try {
      await Deno.writeTextFile(
        this.config.filePath,
        JSON.stringify(this._data, null, 2),
      );
    } catch (e) {
      throw e;
    }
  }

  insert(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      let id = "";
      do {
        id = [...Array(24)].map(() => (~~(Math.random() * 36)).toString(36))
          .join("");
      } while (this.findIndexBy({ _id: id }) !== -1);

      data = Object.assign({ _id: id }, data);
      this._data.push(data);
      resolve(data);
    });
  }

  find(ob?: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    return new Promise((resolve) => {
      if (ob === undefined) {
        resolve(this._data);
        return;
      }
      resolve(this.findAllDataBy(ob));
    });
  }

  findOne(
    ob: Record<string, unknown>,
  ): Promise<Record<string, unknown> | undefined> {
    return new Promise((resolve) => {
      resolve(this.findDataBy(ob));
    });
  }

  findOneAndUpdate(
    ob: Record<string, unknown>,
    replace: Record<string, unknown>,
  ): Promise<Record<string, unknown> | undefined> {
    return new Promise((resolve, reject) => {
      const id = this.findIndexBy(ob);

      if (id === -1) return undefined;

      this._data[id] = { ...this._data[id], ...replace };

      resolve(this._data[id]);
    });
  }

  delete(ob: Record<string, unknown>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const result = this.findIndexBy(ob);
      if (result === -1) resolve(false);
      this._data.splice(result, 1);
      resolve(true);
    });
  }

  exists(ob: Record<string, unknown>): boolean {
    return this._data.some((object) => this.partialContains(object, ob));
  }
}
