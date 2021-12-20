{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.python39
    pkgs.yarn
    pkgs.python39Packages.pip
  ];
}
