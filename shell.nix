{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell rec {
  name = "entity-wiki";
  nativeBuildInputs = with pkgs; [
    pkgs."python312"
    pkgs."python312Packages".pip
    black
    pyright
    taplo
    vscode-langservers-extracted
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
    echo "${name} nix-shell activated: $(which python)"
  '';
}
