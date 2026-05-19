FROM apachesuperset.docker.scarf.sh/apache/superset:6.0.0

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-dev \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
  && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --target=/app/pythonpath \
    authlib \
    psycopg2-binary \
    mysqlclient

USER superset
