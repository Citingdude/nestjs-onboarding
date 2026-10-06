<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# WISEMEN-NEST-CORE

A [NestJS](https://github.com/nestjs/nest) framework TypeScript starter repository.

This project serves as a simple and efficient starting point for building scalable and maintainable applications using NestJS. Follow the steps below to get started.

---

## Prerequisites

Before you begin, ensure the following tools are installed on your machine:

1. **Node.js** (Latest LTS) - [Download here](https://nodejs.org/)
2. **pnpm** (Package Manager) - Install globally using:
   ```bash
   npm install -g pnpm
   ```
3. **Docker** - [Download here](https://www.docker.com/)

### Optional Tools

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **OrbStack** (Docker Desktop alternative) - [Download here](https://orbstack.dev/)

---

## Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

---

## Running the Application

### Project Setup

To setup the project follow these steps:

1. Copy the `env.test` and rename the copy to `.env`
2. Starts all the external services containers:
   ```bash
   docker compose up -d
   ```
3. Apply database migrations (if applicable):
   ```bash
   pnpm run migration:run
   ```

---


### Development Mode (with live reload)

1. Start the application:
   ```bash
   pnpm run start:dev
   ```

2. If you encounter issues, ensure all dependencies are installed and no other process is using port 3000.

---

## Testing

Run tests to ensure the application is functioning as expected:

- Run all tests:
  ```bash
  pnpm run test:run
  ```

- Run a specific test file:
  ```bash
  pnpm run test:one **/file_name.js
  ```

- Run the pipeline:
  ```bash
  pnpm run test:one **/file_name.js
  ```

---

## Troubleshooting

If you encounter issues:

1. Check the logs for errors:
   ```bash
   pnpm run start:dev
   ```
2. Ensure dependencies are installed correctly:
   ```bash
   pnpm install
   ```
3. Verify that Docker is running.

---

## Documentation

- [Backend Playbook](https://wisemen-digital.github.io/backend-playbook/) - Learn about our development practices.
- [ERD](docs/erd.md) - Entity Relationship Diagram.
- [File Upload Guide](docs/files/upload-file.md)

---

## Contribution

We welcome contributions to enhance and expand this project template. If you make changes, please follow these steps:

1. **Update the [CHANGELOG](CHANGELOG.md):**  
   Add a brief description of your modifications, including the ticket or PR reference.

2. **Document Your Changes in the Playbook:**  
   Open a Pull Request (PR) in the Playbook repository. Clearly describe:
   - What you added.
   - How it works.
   - Why the changes are necessary.

By following these steps, you help maintain consistency and ensure the project remains well-documented for all contributors.

This guide is designed to make the setup process as seamless as possible. Happy coding!

