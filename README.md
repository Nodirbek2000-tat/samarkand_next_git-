# Yangi Samarqand — frontend (Next.js 16)

Sayt va admin panel. Ma’lumotlar Django API’dan keladi: `../samarkand`.

## Ishga tushirish

1. Backend’ni ishga tushiring (`../samarkand/README.md`) — `http://127.0.0.1:8000`.
2. `.env.local` (gitga qo‘shilmaydi):

   ```
   DJANGO_URL=http://127.0.0.1:8000
   NEXT_REVALIDATE_SECRET=<backend .env dagi NEXT_REVALIDATE_SECRET bilan bir xil>
   ```

3. `npm install` va `npm run dev` → http://localhost:3000, admin panel → http://localhost:3000/admin

## Qanday ishlaydi

- Brauzer faqat shu domen bilan gaplashadi: `/api/*` va `/media/*` Django’ga proksi qilinadi (`next.config.ts`),
  shuning uchun sessiya cookie va CSRF qo‘shimcha CORS’siz ishlaydi.
- Ommaviy sahifalar server tomonida keshlanadi (`lib/api/server.ts`, `"use cache"` + teglar). Admin biror narsani saqlasa,
  Django `/internal/revalidate` ga teg yuboradi va sahifa darhol yangilanadi.
- `proxy.ts` tizimga kirmagan foydalanuvchini `/admin` dan login sahifasiga yo‘naltiradi; haqiqiy ruxsat tekshiruvi Django’da.
- Kunduzgi (asosiy) va tungi rejim: `lib/theme.ts`, ranglar `app/globals.css` dagi tokenlarda.

## Tuzilma

| Joy | Nima |
|---|---|
| `app/page.tsx` | Bosh sahifa (3D Registon, kinematik bo‘limlar) |
| `app/(site)/…` | Ichki sahifalar: Biz haqimizda, Kengash, Loyihalar, Forum, Media, Hamkorlik, Aloqa, qidiruv |
| `app/admin/…` | Admin panel (login, dashboard, barcha bo‘limlar, murojaatlar, sozlamalar, xodimlar, profil) |
| `components/site` | Sayt komponentlari (header mega-menyu, kartochkalar, formalar, lightbox…) |
| `components/admin` | Admin komponentlari (ro‘yxat, forma, matn muharriri, rasm/hujjat menejerlari, forum muharriri) |
| `lib/admin/resources.ts` | Har bir admin bo‘limining ustunlari va forma maydonlari — yangi maydon qo‘shish shu yerdan |

## Tekshiruvlar

```bash
npx tsc --noEmit
npx eslint app components lib
```
