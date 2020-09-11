export class BaseModel {


  checkFields(row?) {
    if (row) {
      for (let prop in this) {
        if (this.hasOwnProperty(prop)) {
            this[prop] =  row[prop];
        }
      }
    }
  }

}
