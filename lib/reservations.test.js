//const reservations = require('./reservations');
const Reservation = require('./schema/reservation');

describe('fetch', () => {
  let reservations;
  beforeAll(() => {
    jest.mock('./reservations')
    reservations = require('./reservations');
  });

  afterAll(() => {
    jest.unmock('./reservations');
  });

  it('should be mocked and not create a database record', () => {
    expect(reservations.fetch()).toBeUndefined();
  });

});

describe('save', () => {
  let reservations;

  const mockDebug = jest.fn();
  const mockInsert = jest.fn().mockResolvedValue([1]);

  beforeAll(() => {
    jest.mock('debug',() => () =>mockDebug);
    jest.mock('./knex', () => () => ({
      insert: mockInsert,
    }));

    reservations = require('./reservations');

  });

  afterAll(() => {
    jest.unmock('debug');
    jest.unmock('./knex');
  });

  it('should resolve with the ID upon success', async () => {
    const value = { foo: 'bar' };
    const expected = [1];

    const actual = await reservations.save(value);

    expect(actual).toStrictEqual(expected);
    expect(mockDebug).toBeCalledTimes(1);
    expect(mockInsert).toBeCalledWith(value);
  });
});

describe('validate', () => {
  let reservations;
  beforeAll(() => {
    reservations = require('./reservations');
  });

  it('should resolve with no optional fields', () => {
    const correctReservation = new Reservation({
      date: '2021/11/17',
      time: '06:02 AM',
      party: 4,
      name: 'Family',
      email: 'username@example.com'
    });

    return reservations.validate(correctReservation).then(value => expect(value).toEqual(correctReservation));
  });

  it('should reject with invalid email', () => {
    const incorrectReservation = new Reservation({
      date: '2021/11/17',
      time: '06:02 AM',
      party: 4,
      name: 'Family',
      email: 'username'
    });

    expect.assertions(1);

    return reservations.validate(incorrectReservation).catch(error => expect(error).toBeInstanceOf(Error));
  });

  it('should be called and reject empty input', async () => {
    const mock = jest.spyOn(reservations, 'validate');

    const value = undefined;

    await expect(reservations.validate(value)).rejects.toThrow('Cannot read property \'validate\' of undefined');

    expect(mock).toBeCalledWith(value);

    mock.mockRestore();
  });
});


describe('create', () => {

  let reservations;

  it('should reject if validation fails', async () => {
    reservations = require('./reservations');

    // Store the original
    const original = reservations.validate;

    const error = new Error('Fail');

    //mock the function
    reservations.validate = jest.fn(() => Promise.reject(error));

    await expect(reservations.create()).rejects.toBe(error);

    expect(reservations.validate).toBeCalledTimes(1);

    //Restore Original function
    reservations.validate = original;
  });

  it('should reject if validation fails using spyOn', async () => {
    reservations = require('./reservations');

    const mock = jest.spyOn(reservations, 'validate');

    const error = new Error('Fail');

    mock.mockImplementation(() => Promise.reject(error));

    const value = 'puppy';

    await expect(reservations.create(value)).rejects.toEqual(error);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(value);

    mock.mockRestore();

  });

  it('should create a reservation if there is no validation problem', async () => {
    // Prepare to require
    const expectedInsertId = 1;
    const mockInsert = jest.fn().mockResolvedValue([expectedInsertId]);

    jest.mock('./knex', () => () => ({
      insert: mockInsert,
    }));

    reservations = require('./reservations');

    // Mock validation
    const mockValidation = jest.spyOn(reservations, 'validate');
    mockValidation.mockImplementation(value => Promise.resolve(value));

    // Prepare Test Data
    const reservation = { foo: 'bar' };

    // Execute and Check
    await expect(reservations.create(reservation)).resolves.toStrictEqual(expectedInsertId);

    expect(reservations.validate).toHaveBeenCalledTimes(1);
    expect(mockValidation).toBeCalledWith(reservation);
    expect(mockValidation).toBeCalledTimes(1);

    //Restore
    mockValidation.mockRestore();
    jest.unmock('./knex');

  });
});
