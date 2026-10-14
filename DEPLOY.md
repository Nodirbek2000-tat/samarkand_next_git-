# Frontend (Next.js + Nginx + SSL) — serverga chiqarish

Tartib: **1. backend → 2. frontend → 3. bot**. Backend allaqachon ishlab turgan bo‘lishi kerak
(u umumiy `mentadbirkor` tarmog‘ini va `mentadbirkor_media` / `mentadbirkor_static` volume'larini ishlatadi).

## 0. Domen (DNS) — birinchi marta

Domen panelida **A** yozuvlari server IP manziliga: `mentadbirkor.uz` va `www.mentadbirkor.uz`.
`ping mentadbirkor.uz` server IP ni ko‘rsatmaguncha SSL olinmaydi. Portlar ochiq bo‘lsin:

```bash
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
```

## 1. O‘rnatish

```bash
git clone https://github.com/Nodirbek2000-tat/samarkand_next_git-.git /opt/mentadbirkor/frontend
cd /opt/mentadbirkor/frontend
cp server.env.example .env
nano .env        # backend dagi bilan bir xil NEXT_REVALIDATE_SECRET (CERTBOT_EMAIL — domen ishlagach)
docker compose up -d --build
```

Birinchi marta 5–10 daqiqa (sayt yig‘iladi). Serverda kamida 2 GB RAM bo‘lsin
(1 GB bo‘lsa swap qo‘shing).

## 2. Tekshirish va loglar

```bash
docker compose ps
docker compose logs -f nginx
docker compose logs -f frontend
```

Ochib ko‘ring: hozircha http://173.249.39.129 (domen ishlagach — https://mentadbirkor.uz)

## Domen ishlagach: HTTP → HTTPS

Hozir `.env` dagi `COMPOSE_FILE=...http.yml` qatori tufayli sayt oddiy HTTP da, IP orqali ishlaydi.
Domenning A yozuvi serverga ko‘rsatganda:

1. frontend `.env`: `COMPOSE_FILE` qatorini o‘chiring, `CERTBOT_EMAIL` ni yozing;
2. backend `.env`: `DJANGO_HTTPS=true`;
3. bot `.env`: `SITE_URL=https://mentadbirkor.uz`;
4. har birida `docker compose up -d` — sertifikat avtomatik olinadi.

## 3. Yangilash

```bash
cd /opt/mentadbirkor/frontend
git pull
docker compose up -d --build
```

## Muammolar

| Belgisi | Yechim |
|---|---|
| Sertifikat olinmayapti | DNS hali serverga ko‘rsatmayapti yoki 80-port yopiq — `docker compose logs nginx` |
| Ko‘p urinishdan keyin Let’s Encrypt bloklaydi | `.env` da `CERTBOT_STAGING=1` bilan sinang, ishlagach `0` ga qaytaring |
| `/api` 502 beradi | backend ishlamayapti: `/opt/mentadbirkor/backend` da `docker compose ps` |
