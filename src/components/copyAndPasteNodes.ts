import { createUUID } from 'utils';

export default class {
  dicForNewUuids = {};

  createNewUuids(array: any): any {
    if (array instanceof Array) {
      return array.map(this.createNewUuids.bind(this));
    } else if (array instanceof Object) {
      const i = {};

      for (let key in array) {
        let newKey = key;

        if (
          /^update:[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(
            newKey
          )
        ) {
          // @ts-ignore
          if (!this.dicForNewUuids[newKey]) {
            // @ts-ignore
            this.dicForNewUuids[newKey] = createUUID();
          }

          // @ts-ignore
          newKey = this.dicForNewUuids[newKey];
        }

        // @ts-ignore
        i[newKey] = this.createNewUuids.bind(this)(array[key]);
      }

      return i;
    } else if (typeof array === 'string') {
      if (
        /^update:[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(
          array
        )
      ) {
        // @ts-ignore
        if (!this.dicForNewUuids[array]) {
          // @ts-ignore
          this.dicForNewUuids[array] = createUUID();
        }

        // @ts-ignore
        return this.dicForNewUuids[array];
      }
    }

    return array;
  }

  replaceUuidsToUpdate(array: any): any {
    if (array instanceof Array) {
      return array.map(this.replaceUuidsToUpdate.bind(this));
    } else if (array instanceof Object) {
      const i = {};

      for (let key in array) {
        let newKey = key;

        if (
          /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(
            newKey
          )
        ) {
          newKey = newKey.replace(
            /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/,
            'update:$1'
          );
        }

        // @ts-ignore
        i[newKey] = this.replaceUuidsToUpdate.bind(this)(array[key]);
      }

      return i;
    } else if (typeof array === 'string') {
      if (
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(
          array
        )
      ) {
        return array.replace(
          /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/,
          'update:$1'
        );
      }
    }

    return array;
  }
}
