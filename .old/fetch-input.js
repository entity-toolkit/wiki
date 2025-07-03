document.addEventListener("DOMContentLoaded", () => {
  fetch('https://raw.githubusercontent.com/entity-toolkit/entity/refs/heads/1.2.0rc/input.example.toml')
      .then(response => response.text())
      .then(text => {
          const input = document.getElementById('input');
          
          const pre = document.createElement('pre');
          pre.style.whiteSpace = 'pre-wrap';

          const code = document.createElement('code');
          code.textContent = text;
          
          pre.appendChild(code);

          input.appendChild(pre);

          hljs.highlightElement(code, true);
      });
});