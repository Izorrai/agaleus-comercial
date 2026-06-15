# Despliegue en servidor propio (Docker + Cloudflare Tunnel)

Esta guia despliega `comercialaceite.agaleus.com` en el servidor `servidordocker` (Linux + Docker + tunel `recogidas`).

## Lo que monta

```
comercialaceite.agaleus.com ──[Cloudflare Tunnel "recogidas"]──> 192.168.254.112:5051 ──[nginx]──> /home/agaleus/comercial
                                                                                                       ^
                                                                                                       |
                                                                                          cron */5min en host (git pull)
```

A diferencia de `bolilla`, esta app es **100% estatica** (HTML + CSS + JS). No hay backend en Python: todo el guardado se hace contra el Apps Script de Google que reenvia a Google Sheet + Excel SharePoint + email.

## Instalacion (una sola vez)

Conectate al servidor por SSH (Bitvise) como `agaleus` y pega esto:

```bash
# 1. Clonar el repo en home
cd ~
git clone https://github.com/Izorrai/agaleus-comercial.git comercial
cd comercial

# 2. Levantar nginx en port 5051
cd deploy
docker compose up -d
docker ps | grep comercial-web

# 3. Probar localmente
curl -I http://localhost:5051/
curl http://localhost:5051/ | head -5

# 4. Registrar el cron en el usuario agaleus (cada 5 min)
chmod +x cron-update.sh
( crontab -l 2>/dev/null; echo "*/5 * * * * cd /home/agaleus/comercial && bash deploy/cron-update.sh >> /home/agaleus/comercial/deploy/cron.log 2>&1" ) | sort -u | crontab -
crontab -l
```

## Configurar Cloudflare Tunnel

El tunel `recogidas` ya esta corriendo (lo usa la bolilla). Solo hay que anadir el host y el DNS.

```bash
# 5. Crear el CNAME en Cloudflare (usa el cert.pem que ya tienes en home)
cloudflared tunnel route dns recogidas comercialaceite.agaleus.com

# 6. Anadir la ruta al config.yml del tunel (root)
sudo nano /etc/cloudflared/config.yml
```

Anade el bloque marcado al final de `ingress:`, **antes** del `service: http_status:404`:

```yaml
ingress:
  - hostname: recogidas.agaleus.com
    service: http://192.168.254.112:5002

  - hostname: epis.agaleus.com
    service: http://192.168.254.112:6080

  - hostname: hub.agaleus.com
    service: http://192.168.254.112:9090

  - hostname: firmas.agaleus.com
    service: http://192.168.254.112:5000

  - hostname: bolilla.agaleus.com
    service: http://192.168.254.112:5050

  # >>> NUEVO <<<
  - hostname: comercialaceite.agaleus.com
    service: http://192.168.254.112:5051

  - service: http_status:404
```

```bash
# 7. Reiniciar cloudflared
sudo systemctl restart cloudflared
sudo systemctl status cloudflared | head -10

# 8. Verificar desde fuera (en ~30s tras el restart)
curl -I https://comercialaceite.agaleus.com
```

## Operativa diaria

- **Actualizar la app**: editas localmente, `git commit && git push`. El cron del servidor hace `git pull` cada 5 min y nginx sirve los archivos al instante (sin reiniciar contenedor).
- **Cambiar la URL del Apps Script**: edita `app.js` linea 5 (`WEBAPP_URL`), commit, push. En 5 min esta vivo.
- **Anadir campos al formulario**: requiere tocar `index.html`, `app.js`, `apps_script.gs` (este ultimo en el editor de Google Apps Script directamente, no se sirve desde aqui), columna del Excel SharePoint, columna de la Google Sheet.

## Ver logs y diagnostico

```bash
# Cron
tail -f /home/agaleus/comercial/deploy/cron.log

# Nginx (en el contenedor)
docker logs -f comercial-web

# Cloudflared
sudo journalctl -u cloudflared -f
```

## Parar / reiniciar

```bash
cd /home/agaleus/comercial/deploy
docker compose down       # parar
docker compose up -d      # arrancar
docker compose restart    # reiniciar
```

## Quitar todo

```bash
# Sacar el cron
crontab -l | grep -v "/home/agaleus/comercial" | crontab -

# Parar y borrar el container
cd /home/agaleus/comercial/deploy
docker compose down

# Quitar la ruta del tunel: edita /etc/cloudflared/config.yml y borra el bloque comercialaceite, despues
sudo systemctl restart cloudflared

# Borrar la carpeta
rm -rf /home/agaleus/comercial
```
