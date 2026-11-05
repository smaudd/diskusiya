# Diskusiya

### A simple discussion board built with Pocketbase and Shablon

**Diskusiya** (discussion in Bulgarian) is heavily inspired by the works of **Gani Georgiev** and the name was chosen to follow the same naming idea as **Shablon**

This is primarly an experiment to hone my knowledge in Pocketbase and Shablon 

### Already done (with needed improvements of course)

- Feed with pagination listing discussions
- Modals with the exact same implementation as Pocketbase's client admin app
- Toasts with the exact same implementation as Pocketbase's client admin app
- Multi language support using user's language preference
- Client cache for discussion listings (this is wacky at best but seems to work)
- Discussion listings use URLs with slugs
- Discussion edition and deletion (if title is updated slug will be too)

### TODO

- Testing
- Document with JSDoc
- Discussion replies
- Discussion reply with replying to

### Caveats

I'm still unsure if I should keep using Shablon with ES6 imports instead of making it available in the global scope like Pocketbase does 

### Notice

- This project is being developed without AI agents or assitance since I'm tired of that bullshit
- This is README is just a badly written draft, I'll be improving it alongside the project