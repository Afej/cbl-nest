# Central Bank of Learnable v2.0

Previous versions:

- [CBL v1 Clean](https://github.com/Afej/cbl)
- [CBL v1 Main](https://github.com/Afej/cbl/tree/main)

## Nest JS version

A basic banking API service built using nest js with the following features:

### Users can :

- Register for a new account
- Login
- Deposit money
- Withdraw money
- Transfer funds to other users
- See a list of their transactions with filters
- See their wallet
- See their profile and edit it
- Change their password

### Admin can :

- Get all users with filters
- Get single user
- Add users
- Delete users
- Reverse transactions(transfer)
- Disable a user's account (update user)
- Get all user transactions with filters
- Get single user transaction

## Usage

Create a `.env` file in the root directory.
Copy the content of env.sample into the just created .env file, and add the appropriate values.

## Project setup

```bash
$ yarn install
```

## Seed admin user to DB if none exists

```bash
$ yarn seed:admin
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## API Documentation

Detailed API documentation will be available at `http://<host>:<port>/api#/` after server has been spun up.

Example:

- Local development: [Documentation](http://localhost:3000/api#/)
- Custom port: Replace port 3000 with your configured port number

[View Postman Documentation](https://documenter.getpostman.com/view/6355780/UVR7Mp3h)

## Author

[Joshua Afekuro](https://github.com/afej)
