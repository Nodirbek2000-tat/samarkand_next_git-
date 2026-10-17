# Frontend (Next.js + Nginx + SSL) — serverga chiqarish

Tartib: **1. backend → 2. frontend → 3. bot**. Backend allaqachon ishlab turgan bo‘lishi kerak
(u umumiy `mentadbirkor` tarmog‘ini va `mentadbirkor_media` / `mentadbirkor_static` volume'larini ishlatadi).

Sayt faqat **https://mentadbirkor.uz** da ochiladi (`www` → asosiy domenga). Server IP orqali kirilsa,
ulanish yopiladi (`nginx/user_conf.d/00-only-domain.conf`).

## 0. Domen (DNS) — birinchi marta

Domen panelida **A** yozuvlari aynan shu server IP manziliga: `mentadbirkor.uz` va `www.mentadbirkor.uz`.
Tekshirish: `getent hosts mentadbirkor.uz` server IP ni ko‘rsatmaguncha sertifikat olinmaydi. Portlar ochiq bo‘lsin:

```bash
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
```

## 1. O‘rnatish

```bash
git clone https://github.com/Nodirbek2000-tat/samarkand_next_git-.git /opt/mentadbirkor/frontend
cd /opt/mentadbirkor/frontend
cp server.env.example .env
nano .env        # CERTBOT_EMAIL va backend dagi bilan bir xil NEXT_REVALIDATE_SECRET
docker compose up -d --build
```

Birinchi marta 5–10 daqiqa (sayt yig‘iladi). Serverda kamida 2 GB RAM bo‘lsin (1 GB bo‘lsa swap qo‘shing).

## SSL qanday ishlaydi

`nginx` konteyneri (jonasal/nginx-certbot) Let’s Encrypt sertifikatini **o‘zi oladi**, **har 12 soatda**
yangilash kerakmi-yo‘qmi tekshiradi (muddati 30 kundan kam qolganda yangilaydi) va nginx ni o‘zi qayta yuklaydi.
Sertifikatlar `letsencrypt` volume'ida saqlanadi — konteyner qayta yaratilsa ham yo‘qolmaydi.
Hech qanday cron kerak emas.

## 2. Tekshirish va loglar

```bash
docker compose ps
docker compose exec nginx nginx -t          # konfiguratsiya to‘g‘rimi
docker compose logs -f nginx                # sertifikat olinishi shu yerda ko‘rinadi
docker compose logs -f frontend
```

Ochib ko‘ring: https://mentadbirkor.uz

## 3. Yangilash

```bash
cd /opt/mentadbirkor/frontend
git pull
docker compose up -d --build
```

## Muammolar

| Belgisi | Yechim |
|---|---|
| Sertifikat olinmayapti | DNS hali shu serverga ko‘rsatmayapti yoki 80-port yopiq — `docker compose logs nginx` |
| Ko‘p urinishdan keyin Let’s Encrypt bloklaydi | `.env` da `CERTBOT_STAGING=1` bilan sinang, ishlagach `0` ga qaytaring |
| `docker compose` «CERTBOT_EMAIL kerak» deydi | `.env` ga `CERTBOT_EMAIL=...` yozing |
| `/api` 502 beradi | backend ishlamayapti: `/opt/mentadbirkor/backend` da `docker compose ps` |
