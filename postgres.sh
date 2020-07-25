docker stop skeleton
docker rm skeleton
docker run --name skeleton -p 5432:5432 -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=skeleton -d mdillon/postgis