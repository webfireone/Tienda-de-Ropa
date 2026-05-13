const GOOGLE_FONTS = [
  "Inter:wght@300;400;500;600;700;800",
  "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500",
  "Dancing+Script:wght@400;500;600;700",
  "Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500",
  "Montserrat:wght@100;200;300;400;500;600;700;800;900",
  "Space+Grotesk:wght@300;400;500;600;700",
  "Bebas+Neue",
  "Oswald:wght@200;300;400;500;600;700",
  "Abril+Fatface",
  "Alfa+Slab+One",
  "Bitter:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400",
  "Josefin+Sans:wght@100;200;300;400;500;600;700",
  "DM+Serif+Display:ital@0;1",
  "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900",
  "Sora:wght@100;200;300;400;500;600;700;800",
  "Syne:wght@400;500;600;700;800",
  "Unbounded:wght@200;300;400;500;600;700;800;900",
  "Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400",
  "Cinzel:wght@400;500;600;700;800;900",
  "Poppins:wght@100;200;300;400;500;600;700;800;900",
  "Lato:wght@100;300;400;700;900",
  "Nunito:wght@200;300;400;500;600;700;800;900",
  "Outfit:wght@100;200;300;400;500;600;700;800;900",
  "Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800",
  "Manrope:wght@200;300;400;500;600;700;800",
  "DM+Sans:wght@100;200;300;400;500;600;700",
  "Lexend:wght@100;200;300;400;500;600;700;800;900",
  "Karla:wght@100;200;300;400;500;600;700;800",
  "Jost:wght@100;200;300;400;500;600;700;800;900",
]

const link = document.createElement("link")
link.rel = "stylesheet"
link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.join("&family=")}&display=swap`
document.head.appendChild(link)
