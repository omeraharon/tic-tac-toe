export class BoxModel {
    public id: string = Math.floor(Math.random() * 999999999999).toString();
    public isChecked: boolean = false;
    checkedRival = ""
}