// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// including this file in a package allows for the use of import statements
// with png files. Example: `import screenshot from 'path/screenshot.png'`

declare module '*.png' {
  const value: string;
  export default value;
}
