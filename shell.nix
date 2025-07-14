{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell rec {
  name = "entity-wiki";
  nativeBuildInputs = with pkgs; [
    pkgs.python312
    pkgs.python312Packages.pip
    nodePackages.nodejs
    black
    pyright
    taplo
    vscode-langservers-extracted
    yaml-language-server
    typescript-language-server
    emmet-ls
    markdown-oxide
    zlib
  ];
  LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
    pkgs.stdenv.cc.cc
    pkgs.zlib
  ];

  shellHook = ''
    if [ -d .venv ]; then
      source .venv/bin/activate
    else
      python3 -m venv .venv
      source .venv/bin/activate
      pip install -r requirements.txt
    fi
    if [ ! -d node_modules ]; then
      npm i
    fi
    echo "${name} nix-shell activated: $(which python) $(which npm)"
  '';
}
