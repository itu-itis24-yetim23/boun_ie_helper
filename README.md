# BOUN IE Helper

Boğaziçi Üniversitesi Endüstri Mühendisliği öğrencileri için açık kaynaklı öğrenci aracı.

## İçerik

- 2024-2025 ve sonrasında IE'ye başlayanlar için 8 dönemlik müfredat görünümü
- Tıklanabilir IE önkoşul zinciri
- BUIS dönem verisinden şube arama ve çakışmasız ders programı kombinasyonları
- En erken / en geç ders saati ve boş gün filtresi
- Boğaziçi kısayolları
- Günlük BUIS veri güncellemesi için GitHub Actions
- GitHub Pages deployment workflow

> Bu proje resmî Boğaziçi Üniversitesi ürünü değildir. Kayıt ve mezuniyet kararlarında bölüm, BUIS ve Öğrenci İşleri kaynakları esas alınmalıdır.

## Kaynaklar

Müfredat: `https://ie.bogazici.edu.tr/tr/node/1613`

IE dersleri ve önkoşulları: `https://ie.bogazici.edu.tr/undergraduate-courses`

Dönem ders programı: `https://registration.bogazici.edu.tr/buis/General/schedule.aspx?p=semester`

## Lokal çalıştırma

```bash
npm install
npm run update:data
npm run serve
```

Sonra `http://localhost:8080` adresini aç.

`update:data`, BUIS'in herkese açık dönem ve bölüm tablolarını okuyup `data/courses.json` üretir. Statik site bu dosyayı kullanır.

## GitHub Pages

1. Repoyu GitHub'a yükle.
2. Repository Settings → Pages → Source: **GitHub Actions**.
3. `Update BUIS course data` workflow'unu bir kez manuel çalıştır.
4. `Deploy GitHub Pages` otomatik yayınlar.

## Notlar / v0.1 sınırları

Programlayıcı v0.1'de her ana ders için bir lecture section seçer ve saat çakışmalarını engeller. LAB / P.S. satırları veri setinde tutulur ancak kombinasyon motoruna henüz zorunlu/alternatif laboratuvar mantığı eklenmemiştir. Önkoşul grafiği bölümün yayımladığı açık önkoşulları gösterir; "instructor consent" gibi alternatifleri zincire zorunlu kenar olarak eklemez.
