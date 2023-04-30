# examples/r3f-zustand

This is the "kitchen sink" example of an orbit camera controller in react-three-fiber, using Zustand for state management.

To try it, run:

```sh
npm install
npm run dev
```

You can also import <./src/Controls> as a library:

```js
import {
  Controls,
  useCamera,
  updateCamera,
  useCameraConfig,
  updateCameraConfig
} from `control-kit/examples/r3f-zustand/src/Controls`
```

**Note:** Changes to <./src/Controls> must follow semver!
