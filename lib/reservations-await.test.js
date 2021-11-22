// Another way of writing the reservations test
// uses async/await instead

const reservations = require('./reservations');
const Reservation = require('./schema/reservation');

describe('validate', () => {
  it('should resolve with no optional fields', async() => {
    const correctReservation = new Reservation({
      date: '2021/11/17',
      time: '06:02 AM',
      party: 4,
      name: 'Family',
      email: 'username@example.com'
    });

    await expect(reservations.validate(correctReservation)).resolves.toEqual(correctReservation);
  });

  it('should reject with invalid email', async() => {
    const incorrectReservation = new Reservation({
      date: '2021/11/17',
      time: '06:02 AM',
      party: 4,
      name: 'Family',
      email: 'username'
    });

    await expect(reservations.validate(incorrectReservation)).rejects.toBeInstanceOf(Error);
  })
})
