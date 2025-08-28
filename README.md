> **Warning**
>
> The POAP SDK is still in the active initial development phase. Anything MAY change at any time.
>
> This is a Developer Preview aimed primarily at existing integrators to gather early feedback.
> Documentation is in progress.
>
> This product is in development and is not intended to be used in a production environment.
>
> If you want to collaborate and leave us feedback, you can do so [here](https://github.com/poap-xyz/poap.js/discussions/19)

# POAP.js

POAP.js is a collection of SDKs and utilities for interacting with the POAP ecosystem. The
library provides a set of classes and methods to simplify working with it.

## Installation

### npm

```bash
npm install @poap-xyz/poap-sdk
```

### pnpm

```bash
pnpm add @poap-xyz/poap-sdk
```

### yarn

```bash
yarn add @poap-xyz/poap-sdk
```

## Table of Contents

- [POAP.js](#poapjs)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Development](#development)
  - [Documentation](#documentation)
  - [Contributing](#contributing)
  - [License](#license)

## Features

### POAPs

- Fetch one or multiple POAP tokens at once.
- Search for minted POAPs by their collector or the drop they belong to.
- Mint POAPs using synchronous or asynchronous processes.
- Reserve a POAP to an email address.
- Obtain mint status, POAP indexed status, and more.

### Drops 

- Create a Drop
- Update a Drop attributes
- Fetch a single Drop
- Fetch multiple Drops
- Search Drops

### Moments

- Create a Moment attached to a Drop or a specific POAP
- Fetch multiple Moments
- Fetch a single Moment

### Providers

- Interfaces to interact with POAP APIs
- POAP custom Providers so you can use without implementing one.

### Utils

- PaginatedResult: A paginated interface that makes it easier to manage paginated results
- SecureFetch: A wrapper for headers that inserts the authentication with POAP.

## Development

To start developing the POAP Package Library, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/poap-xyz/poap.js.git
```

2. Use node and pnpm:

```bash
nvm use
corepack enable
```

3. Install dependencies:

```bash
pnpm install
```

4. Build the packages:

```bash
pnpm build
```

5. Run the tests:

```bash
pnpm test
```

## Documentation

You can find the documentation in this link: [POAP.js Documentation](https://sdk.poap.tech/)

The documentation is located in the `docs` folder.

## Contributing

Contributions to the POAP Package Library are welcome. To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch with a descriptive name.
3. Make your changes and commit them with a clear and concise commit message.
4. Create a pull request, describing the changes you made and why.
5. Wait for a maintainer to review your pull request and provide feedback.

Please ensure that your code adheres to the project's code style and passes all tests before
submitting a pull request.

See [`CONTRIBUTING.md`](./.github/CONTRIBUTING.md) file for guidelines on how to get involved.

## License

MIT © **[`POAP`](https://poap.xyz)**
