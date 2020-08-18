export class BaseModel {


  checkFields(row?) {
    if (row) {
      for (const prop in this) {
        if (this.hasOwnProperty(prop)) {
            this[prop] =  row[prop];
        }
      }
    }
  }

}
