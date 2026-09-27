{ pkgs, ... }:

{
  name = "entity-wiki";

  packages = with pkgs; [
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

  languages.python = {
    enable = true;
    package = pkgs.python313;
    libraries = with pkgs; [
      stdenv.cc.cc
      zlib
    ];
    venv = {
      enable = true;
      requirements = ./requirements.txt;
    };
  };

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs;
    npm = {
      enable = true;
      install.enable = true;
    };
  };

  enterShell = ''
    echo "entity-wiki devenv activated"
  '';
}
