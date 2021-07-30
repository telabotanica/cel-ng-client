export class DateFormatter {

  // JSON Stringifying date is based on GWT so we get yesterday. Thus we have
  // to format it by ourself
  // https://stackoverflow.com/questions/44744476/angular-material-datepicker-date-becomes-one-day-before-selected-date
  // @refactor: use moment.js instead...
  static format(date: Date): string {
    return  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T12:00:00`;
  }

}
