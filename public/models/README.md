# 3D Tour Model

Drop the exported scan here as **`shop-tour.glb`**.

## How to capture it

1. Scan the indoor arched corridor with [Polycam](https://poly.cam) (LiDAR mode on iPhone Pro, photo mode otherwise) — walk slowly, covering ~180° at each arch.
2. Scan the exterior facade/walkway as a **separate** pass (indoor/outdoor light doesn't blend well in one scan).
3. Export as `.glb` (Polycam: Export → glTF/GLB).
4. Rename the file to `shop-tour.glb` and place it in this folder (`public/models/shop-tour.glb`).
5. Keep the file under ~15MB if possible — use Polycam's "Web/AR optimized" export setting, or run it through [gltf-transform](https://gltf-transform.dev/) (`npx @gltf-transform/cli optimize shop-tour.glb shop-tour.glb --compress draco`) to shrink it further.

Once the file exists at this path, the "Walk Through" section on the homepage will automatically pick it up — no code changes needed.
