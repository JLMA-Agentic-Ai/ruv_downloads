## Creas tu carpeta con el nombre que quieres.

## Descomprimes "dentro" de ella, pero eliminando la carpeta raíz que trae el .tgz.

## bash

mkdir mi_carpeta_custom
tar -xzvf archivo.tgz -C mi_carpeta_custom --strip-components=1


## --strip-components=1: Esto le dice a tar que ignore la primera carpeta (la raíz) dentro del comprimido y tire todo el contenido suelto en tu destino.