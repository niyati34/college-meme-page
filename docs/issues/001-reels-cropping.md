# Issue: Instagram-style Reels are shown as cropped square posts

## Summary
Admins upload 9:16 vertical videos/images (Reels), but they render as square posts in the feed and details, causing content to be cropped. This impacts both admin (upload intent lost) and users (content not fully visible).

## Root Causes
- Backend `createMeme` does not persist the `aspectRatio` value sent from the upload form, defaulting to `normal`.
- Frontend media containers force `aspect-square` and media `object-cover`, which crops tall content.

## Scope
1. Persist `aspectRatio` ("normal" | "reel") on upload and include it in `getMeme` response.
2. Frontend: Use container aspect based on `meme.aspectRatio` and avoid cropping for reels (letterbox with `object-contain`).
3. Ensure feed (`MemeCard`) and detail (`MemeDetails`) respect aspect ratio; optional: Trending card.

## Acceptance Criteria
- Uploading with Aspect Ratio = Reel stores `aspectRatio: "reel"`.
- Feed and Detail render 9:16 content without cropping (letterboxing as needed).
- Square/landscape content remains unaffected.
- No regressions for likes, comments, pagination, or playback controls.

## Validation Notes
- Test with image and video for both `normal` and `reel`.
- Confirm `getAllMemes` already exposes `aspectRatio`; confirm `getMeme` includes it as well.

## Tasks
- Backend: update `createMeme` to save `aspectRatio` and `getMeme` to return it.
- Frontend: conditional container aspect and media fit for reels in `MemeCard` and `MemeDetails`.
- Commit changes to a feature branch: `fix/reels-9x16-rendering`.


