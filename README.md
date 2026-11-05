# Diskusiya

### A simple discussion board on top of Pocketbase and Shablon

**Diskusiya** (discussion in Bulgarian) is heavily inspired by the works of **Gani Georgiev** and the name was chosen to follow the same inspiration as Shablon

This is primarly an experiment to hone my knowledge in Pocketbase and Shablon 

### Already done (with needed improvements ofcourse)

- Feed with pagination listing discussions
- Modals with the exact same implementation as Pocketbase's client admin app
- Toasts with the exact same implementation as Pocketbase's client admin app
- Internationalization using user's language preference
- Client cache for discussions listings (this is wacky at best but seems to work)


### TODO

- Testing
- Discussion edition
- Discussion deletion
- Discussion replies
- Discussion reply with replying to

### Caveats

I'm still unsure if I should keep using Shablon with ES6 imports instead of making it available in the global scope like Pocketbase does 

### Notice

- This project is being developed without AI agents or assitance since I'm tired of that bullshit
- This is README is just a bad written draft, I'll be improving it alongside the project