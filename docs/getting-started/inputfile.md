---
hide:
  - footer
---

# Input parameters

Entity reads almost all the information (except for the problem generator) about the simulation at runtime from an input file provided in the `.toml` format. The most up-to-date full version of the input file with all the possible input parameters with their descriptions can be found in the root directory of the main repository in the `input.example.toml`.

{% include "html/hljs.html" %}

<div id="input"></div>

<script type="module">
    fetch('https://raw.githubusercontent.com/entity-toolkit/entity/v1.0.0/input.example.toml')
        .then(response => response.text())
        .then(text => {
            const input = document.getElementById('input');
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = 'language-toml';
            code.textContent = text;
            pre.appendChild(code);
            input.appendChild(pre);
            hljs.highlightElement(code, true);
        });
</script>

<!-- 
<style>
ul.tree, ul.tree ul {
list-style: none;
  margin: 0;
  padding: 0;
} 
ul.tree ul {
  margin-left: 10px;
}
ul.tree li {
  margin: 0;
  padding: 0 7px;
  line-height: 20px;
XS  font-weight: bold;
  border-left:1px solid rgb(100,100,100);

}
ul.tree li:last-child {
    border-left:none;
}
ul.tree li:before {
  position:relative;
  top:-0.3em;
  height:1em;
  width:12px;
  color:white;
  border-bottom:1px solid rgb(100,100,100);
  content:"";
  display:inline-block;
  left:-7px;
}
ul.tree li:last-child:before {
  border-left:1px solid rgb(100,100,100);   
} 
</style>

<ul class="tree">
    <li>Animals
     <ul>
      <li>Birds</li>
      <li>Mammals
       <ul>
        <li>Elephant</li>
        <li class="last">Mouse</li>
       </ul>
      </li>
      <li class="last">Reptiles</li>
     </ul>
    </li>
    <li class="last">Plants
     <ul>
      <li>Flowers
       <ul>
        <li>Rose</li>
        <li class="last">Tulip</li>
       </ul>
      </li>
      <li class="last">Trees</li>
     </ul>
    </li>
   </ul> -->
