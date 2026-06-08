# GRUPO10-2026-PROYINF
**Integrantes:**
- Alex Espinosa 202330554-5
- Alejandro Caceres 202373520-5
- Benjamin Caro 202304575-6
- Eduardo Canales 202330524-3
- Felipe Contreras 202304660-4

**Tutor:** Carlos Arébalo 
> **Proyecto Base:** Este repositorio corresponde a la continuación del proyecto desarrollado por el GRUPO24-2025-PROYINF durante el semestre 2025-2.

> [!IMPORTANT]
> La primera vez puede demorarse un poco en levantar los contenedores y la bdd.
>
> A veces el frontend sigue pidiendo recargar aunque la bdd ya este lista. Esto pasa porque el backend no vuelve a cargar algunos datos en cache que obtiene de la bdd.
>
> Si pasa, reinicia el backend (o todos los contenedores) o guarda cualquier archivo del backend (para forzar hot reload). Con eso deberia recuperar los datos correctamente.
>
> Deberia ser un problema solo al iniciar el proyecto por primera vez, luego no deberia ocurrir. Quizas se arregle, quizas no.

## Recursos (Semestre 2025-2)
Los siguientes enlaces corresponden al trabajo realizado y entregado durante el semestre anterior:
- [Wiki del proyecto](https://github.com/not-nen/GRUPO24-2025-PROYINF/wiki)
- [Video del cliente](https://aula.usm.cl/mod/resource/view.php?id=6926137)
- [Video primer prototipo](https://usmcl-my.sharepoint.com/:v:/g/personal/acaceres_usm_cl/EbDgcjI5j8RCq2pHBBNNa5cBkJAX_3yPQFF2VGrWmEJ3CQ?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=9XOcPi)
- [Video Hito 5, que llevamos implementado](https://usmcl-my.sharepoint.com/:v:/g/personal/acaceres_usm_cl/IQCEsKtfKAQmR6mxM022mqO6AXXb_nUxTss4mDAlX7wMMg8?e=MRtu3h)

## Instrucciones

Para construir los contenedores:
```bash
docker-compose build
```

Para levantar los contenedores (una vez ya construidos):
```bash
docker-compose up
```

o si quieres construirlos y levantarlos:

```bash
docker-compose up --build
```

Para levantarlos en segundo plano, sin ver los logs de los contenedores:
```bash
docker-compose up -d
```

Para detener los contenendores:
```bash
docker-compose stop
```

Para detener y eliminar los contenedores, junto con su red creada:
```bash
docker-compose down
```

Para detener y eliminar los contenedores, junto con su red creada y volumenes asociados (hacer esto para que se genere la base de datos en caso de que no aparezca):
```bash
docker-compose down -v
```

> [!IMPORTANT]  
> En windows, `Docker Desktop` debe estar abierto para que todo funcione como corresponde.

> [!IMPORTANT]  
> En linux, el comando es `docker compose`.

### Requerimientos

Se necesita:
- [Docker](https://www.docker.com/)
- `.env` en la raiz del proyecto, con las siguientes variables de entorno:
  - `REACT_APP_GEMINI_API_KEY`: API KEY de [Google AI Studio](https://aistudio.google.com) (puedes pedirnos el API KEY que estamos utilizando igualmente).

## URLs

- **Frontend (React)**: http://localhost:3000

- **Backend (Node)**: http://localhost:5000

- **pgAdmin**: http://localhost:8081
    - Usuario: admin@admin.com
    - Contraseña: admin
    - DB contraseña: postgres







