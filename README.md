# Diskusiya

### A simple discussion board built with Pocketbase and Shablon

**Diskusiya** (discussion in Bulgarian) is heavily inspired by the works of **Gani Georgiev** and the name was chosen to follow the same naming idea as **Shablon**

This project uses Pocketbase v0.40.5, Shablon 0.1.0-rc.1 and Vite 8.3.5 with pnpm

This is primarly an experiment to hone my knowledge in Pocketbase and Shablon 

### Already done (with needed improvements of course)

- Feed with pagination listing discussions
- Modals with the exact same implementation as Pocketbase's client admin app
- Toasts with the exact same implementation as Pocketbase's client admin app
- Multi language support using user's language preference
- Client cache for discussion listings (this is wacky at best but seems to work)
- Discussion listings use URLs with slugs
- Discussion edition and deletion (if title is updated slug will be too)
- Reply creation inside discussion
- One reply nesting depth
- Reply editions and deletions inside discussion
- Users can request email and password resets
- Users can upload avatars

### TODO

- Add pagination to replies
- Testing
- Document with JSDoc
- Discussion replies
- Discussion reply with replying to
- Allow discussions to have images
- Reports for discussions, replies and users (for the first release I'm planning to leverage this to the Pocketbase admin panel to avoid reimplementing, admins are basically superusers in Pocketbase)
- Complete password/email confirmations using emailed token
- Take a look at security
- Improve the cache system
- Include Pocketbase binary with the project? Not sure how to handle this yet

### Caveats

This project uses ES6 for everything instead of declaring global variables

### Notice

- This project is being developed without AI agents or assitance since I'm tired of that bullshit
- This is README is just a badly written draft, I'll be improving it alongside the project