const Reservation = require('./reservation');
const reservation = require('./reservation');

describe('combineDateTime', () => {
  it('should return an ISO Date and Time with valid input', () => {
    const date = '2021/11/17';
    const time = '06:02AM';

    const expected = '2021-11-17T06:02:00.000Z';
    const actual = reservation.combineDateTime(date, time);

    expect(actual).toEqual(expected);
  });

  it('should return null on bad date and time', () => {
    const date = '$%£^';
    const time = 'fail';

    expect(reservation.combineDateTime(date, time)).toBeNull();
  })
});

describe('validate', () => {
  it('should validate with no optional fields', done => {
    const correctReservation = new Reservation({
      date: '2021/11/17',
      time: '06:02 AM',
      party: 4,
      name: 'Family',
      email: 'username@example.com'
    });

    correctReservation.validate((err, value) => {
      try {
        expect(value).toEqual(correctReservation);
        return done(err)
      } catch (error) {
        return done(error);
      }
    })

  });

  it('should invalidate with an invalid email', done => {
    const incorrectReservation = new Reservation({
      date: '2021/11/17',
      time: '06:02 AM',
      party: 4,
      name: 'Family',
      email: 'username'
    });

    incorrectReservation.validate((err) => {
      try {
        expect(err).toBeInstanceOf(Error);
        return done();
      } catch (error) {
        return done(error);
      }
    })

  })
});

