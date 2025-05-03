# Private Cloud

A desktop application built with Electron and Angular that allows users to create their own private cloud storage system. The application can run on Windows, macOS (including ARM), and mobile devices.

## Features

- **Dual Role System**:
  - **Host Mode**: Turn your device into a network storage server
  - **Consumer Mode**: Access files shared by other devices on the network

- **File Management**:
  - Upload and store any type of file
  - Browse and download files from other devices
  - View file details and manage access

- **Image Gallery**:
  - Dedicated view for image files
  - Grid layout for easy browsing
  - Support for various image formats

- **Cross-Platform**:
  - Windows (x64 and ARM)
  - macOS (including Apple Silicon)
  - Mobile device support

## Architecture: Angular vs Electron

This project is a hybrid of two technologies:

- **Electron**: Provides the desktop shell, access to the filesystem, and all network discovery (Bonjour/mDNS) logic. Electron runs Node.js code and can use native modules.
- **Angular**: Provides the frontend UI. Angular runs in a browser-like environment and **cannot** use Node.js modules directly (such as `bonjour`, `fs`, etc).

### How Network Discovery Works
- **Bonjour/mDNS discovery runs only in the Electron main process.**
- The Electron process maintains a list of discovered hosts on the local network.
- The Angular frontend communicates with Electron via IPC (using a preload script and `window.electronAPI`).
- Angular periodically requests the list of discovered hosts from Electron and displays them in the UI.
- All file upload/download operations from a consumer to a host are performed over HTTP, using the host's advertised address and port.

**You cannot use Node.js modules like `bonjour` or `fs` directly in Angular.** All such logic must be handled in Electron and exposed to Angular via IPC.

## Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Angular CLI (v19 or later)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/private-cloud.git
cd private-cloud
```

2. Install dependencies:
```bash
npm install
```

## Development

To run the application in development mode:

1. Start the Angular development server:
```bash
npm start
```

2. In a separate terminal, start the Electron application:
```bash
npm run electron:serve
```

The application will open in an Electron window and will be available at http://localhost:4200 in your web browser.

## Building for Production

To create a production build:

```bash
npm run electron:build
```

This will create distributable packages for your platform in the `dist` directory.

## Project Structure

```
private-cloud/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── file-list/
│   │   │   ├── file-upload/
│   │   │   ├── image-gallery/
│   │   │   └── role-selector/
│   │   ├── pages/
│   │   │   ├── host-page.component.ts
│   │   │   └── consumer-page.component.ts
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── electron/
│   │   ├── main.ts
│   │   └── preload.ts
│   └── styles.scss
├── angular.json
├── electron-tsconfig.json
├── package.json
└── tsconfig.json
```

## Technology Stack

- **Frontend**: Angular 19
- **Desktop**: Electron
- **Styling**: SCSS
- **Language**: TypeScript

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 