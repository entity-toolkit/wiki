document.addEventListener("DOMContentLoaded", () => {
  const contributors_container = document.querySelector(".contributors");
  const contributors = [
    { name: "Ludwig Böss", emoji: "🎸", github: "LudwigBoess" },
    { name: "Yangyang Cai", emoji: "👀", github: "StaticObserver" },
    { name: "Alexander Chernoglazov", emoji: "💁", github: "SChernoglazov" },
    { name: "Benjamin Crinquand", emoji: "🍵", github: "bcrinquand" },
    { name: "Alisa Galishnikova", emoji: "🧋", github: "alisagk" },
    { name: "Xingwei Gong", emoji: "🦥", github: "xwgong01" },
    { name: "Evgeny Gorbunov", emoji: "🚂", github: "Alcauchy" },
    { name: "Camille Granier", emoji: "🐜", github: "K1000Granier" },
    { name: "Michael Grehan", emoji: "🍳", github: "mgrehan" },
    { name: "Hayk Hakobyan", emoji: "☕", github: "haykh" },
    { name: "Anuj Kankani", emoji: "🌄", github: "AnujKankani" },
    { name: "Jens Mahlmann", emoji: "🥔", github: "jmahlmann" },
    { name: "Sasha Philippov", emoji: "🐬", github: "sashaph" },
    { name: "Siddhant Solanki", emoji: "📻", github: "sidruns30" },
    { name: "Andrew Sullivan", emoji: "🥭", github: "a-sullivan" },
    { name: "Arno Vanthieghem", emoji: "🤷", github: "vanthieg" },
    { name: "Muni Zhou", emoji: "🐱", github: "munizhou" },
  ];

  const wrapper = document.createElement("div");
  wrapper.classList.add("tagcloud-wrapper");

  const controls = document.createElement("div");
  controls.classList.add("tagcloud-controls");
  controls.style.setProperty("--num-elements", 0);

  const rotation = document.createElement("div");
  rotation.classList.add("tagcloud-rotation");

  const tags = document.createElement("ul");
  tags.classList.add("tagcloud-tags");
  tags.style.setProperty("--num-elements", contributors.length);

  rotation.appendChild(tags);
  controls.appendChild(rotation);
  wrapper.appendChild(controls);
  contributors_container.appendChild(wrapper);

  contributors
    .sort(() => Math.random() - 0.5)
    .forEach((contributor, index) => {
      const li = document.createElement("li");
      li.classList.add("tagcloud-tag");
      li.style.setProperty("--index", index);
      li.innerHTML = `<div><a href='${contributor.github}' target="_blank">${contributor.emoji} ${contributor.name}</a></div>`;
      tags.appendChild(li);
    });
});
