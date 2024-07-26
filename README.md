# QuiVer Frontend

This is the frontend project for QuiVer. It's based on [Vue 3](https://vuejs.org/).
QuiVer is an optical character recognition (OCR) benchmarking platform and part of the [OCR-D Project](https://ocr-d.de).
This tool has a workflow view, which helps OCR-D users decide which workflow to use for their data by visualising metrics for predefined ground truth datasets.
It also has a project view where OCR-D developers can get an overview of the projects and their status for each release.

It can be found under <https://ocr-d.de/quiver-frontend/>.

See also [QuiVer Benchmarks](https://github.com/OCR-D/quiver-benchmarks/) for more information about the benchmarking.

## Setup

Requires node version 16 or higher.

Install dependencies:

```sh
npm install
```

### Development

Compile and run with hot-reload:

```sh
npm run dev
```

Access under `http://localhost:5173/quiver-frontend/`

### Production

Compile and minify for production:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

### Linting

We use [ESLint](https://eslint.org/) for linting. Check your code with:

```sh
npm run lint
```

## Setup with Docker

Build the Docker image:

```sh
docker build -t qfa .
```

Run a container based on this image:

```sh
docker run --rm -d --name qfa-server -p 8083:80 qfa
```
