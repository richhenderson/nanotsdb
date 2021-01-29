interface DatabaseConfig {
  filePath: string;
  autosave?: boolean;
}

export class NanoTsDb {
  private _data: Record<string, unknown>[] = [];
  private _connected = false;
  private config: DatabaseConfig = {
    filePath: `${Deno.cwd()}/db.json`,
    autosave: false,
  };

  constructor(config?: DatabaseConfig) {
    if (config?.filePath) {
      this.config.filePath = config.filePath;
    }
    if (config?.autosave) {
      this.config.autosave = config.autosave;
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

  private getID() {
    let id = "";
    do {
      id = [...Array(24)].map(() => (~~(Math.random() * 36)).toString(36))
        .join("");
    } while (this.findIndexBy({ _id: id }) !== -1);
    return id;
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
      return true;
    } catch (e) {
      throw e;
    }
  }

  async insert(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const id = this.getID();
    data = Object.assign({ _id: id }, data);
    this._data.push(data);
    if (this.config.autosave) {
      await this.save().catch((err) => {
        throw err;
      });
    }
    return data;
  }

  async insertOne(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const id = this.getID();
    data = Object.assign({ _id: id }, data);
    this._data.push(data);
    if (this.config.autosave) {
      await this.save().catch((err) => {
        throw err;
      });
    }
    return data;
  }

  async insertMany(
    data: Record<string, unknown>[],
  ): Promise<Record<string, unknown>[]> {
    const id = this.getID();
    data.forEach((datum) => {
      datum = Object.assign({ _id: id }, datum);
      this._data.push(datum);
    });
    if (this.config.autosave) {
      await this.save().catch((err) => {
        throw err;
      });
    }
    return data;
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

  async findOneAndUpdate(
    ob: Record<string, unknown>,
    replace: Record<string, unknown>,
  ): Promise<Record<string, unknown> | undefined> {
    const id = this.findIndexBy(ob);

    if (id === -1) return undefined;

    this._data[id] = { ...this._data[id], ...replace };
    if (this.config.autosave) {
      await this.save().catch((err) => {
        throw err;
      });
    }
    return this._data[id];
  }

  async delete(ob: Record<string, unknown>): Promise<boolean> {
    const result = this.findIndexBy(ob);
    if (result === -1) return false;
    this._data.splice(result, 1);
    if (this.config.autosave) {
      await this.save().catch((err) => {
        throw err;
      });
    }
    return true;
  }

  exists(ob: Record<string, unknown>): boolean {
    return this._data.some((object) => this.partialContains(object, ob));
  }
}
