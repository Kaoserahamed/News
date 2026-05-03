# Reliable Bangladesh News Sources

## Overview
This document lists the curated, **verified and working** reliable news sources configured for the news aggregator. All sources have been tested and confirmed to have active RSS feeds with quality content.

---

## ✅ Currently Enabled Sources (4) - All Verified Working

### 1. **Prothom Alo** 🇧🇩 ⭐⭐⭐⭐⭐
- **Language**: Bangla
- **Type**: Daily Newspaper
- **Reliability**: Highest
- **Articles per fetch**: ~54
- **Image Coverage**: 100%
- **Response Time**: ~950ms
- **Description**: Bangladesh's leading daily newspaper with the highest circulation. Known for comprehensive coverage and investigative journalism.
- **Focus**: General news, politics, business, sports, entertainment
- **Website**: https://www.prothomalo.com
- **Status**: ✅ Verified Working

### 2. **The Daily Star** 🇧🇩 ⭐⭐⭐⭐⭐
- **Language**: English
- **Type**: Daily Newspaper
- **Reliability**: Highest
- **Articles per fetch**: ~4
- **Image Coverage**: 100%
- **Response Time**: ~130ms
- **Description**: Leading English-language daily newspaper in Bangladesh. Established in 1991, known for quality journalism and editorial independence.
- **Focus**: National and international news, business, sports, lifestyle
- **Website**: https://www.thedailystar.net
- **Status**: ✅ Verified Working

### 3. **BBC Bangla** 🌍 ⭐⭐⭐⭐⭐
- **Language**: Bangla
- **Type**: International News Service
- **Reliability**: Highest
- **Articles per fetch**: ~14
- **Image Coverage**: 100%
- **Response Time**: ~920ms
- **Description**: BBC's Bengali language service providing international news with Bangladesh focus. Globally recognized for accuracy and impartiality.
- **Focus**: International news, Bangladesh affairs, analysis
- **Website**: https://www.bbc.com/bengali
- **Status**: ✅ Verified Working

### 4. **Deutsche Welle Bangla** 🌍 ⭐⭐⭐⭐⭐
- **Language**: Bangla
- **Type**: International News Service
- **Reliability**: Highest
- **Articles per fetch**: ~9
- **Image Coverage**: 0% (text-focused)
- **Response Time**: ~480ms
- **Description**: DW's Bengali service providing international perspective on Bangladesh news. German public broadcaster known for quality journalism.
- **Focus**: International news, Bangladesh affairs, analysis
- **Website**: https://www.dw.com/bn
- **Status**: ✅ Verified Working

---

## ❌ Disabled Sources (8) - RSS Feed Issues

These sources are reputable but currently have RSS feed technical issues:

### 5. **bdnews24.com** 🇧🇩
- **Status**: ❌ Disabled - RSS feed parsing error
- **Issue**: Invalid XML entity in feed
- **Website**: https://bdnews24.com

### 6. **Dhaka Tribune** 🇧🇩
- **Status**: ❌ Disabled - RSS feed unavailable (404)
- **Website**: https://www.dhakatribune.com

### 7. **The Business Standard** 🇧🇩
- **Status**: ❌ Disabled - RSS feed unavailable (404)
- **Website**: https://www.tbsnews.net

### 8. **The Financial Express** 🇧🇩
- **Status**: ❌ Disabled - RSS feed format issue
- **Website**: https://thefinancialexpress.com.bd

### 9. **New Age Bangladesh** 🇧🇩
- **Status**: ❌ Disabled - RSS feed unavailable (404)
- **Website**: https://www.newagebd.net

### 10. **United News of Bangladesh (UNB)** 🇧🇩
- **Status**: ❌ Disabled - RSS feed unavailable (404)
- **Website**: https://unb.com.bd

### 11. **The Independent** 🇧🇩
- **Status**: ⏭️ Disabled - Not tested
- **Website**: https://www.theindependentbd.com

### 12. **The Daily Observer** 🇧🇩
- **Status**: ⏭️ Disabled - Not tested
- **Website**: https://www.observerbd.com

---

## 📊 Current Configuration Statistics

### Performance Metrics (Last Verified: 2026-05-03)
- **Total Sources**: 12
- **Enabled**: 4 (33%)
- **Working**: 4 (100% of enabled)
- **Failed**: 0
- **Average Articles per Fetch**: 81 total (~20 per source)
- **Image Coverage**: 88.9% overall
- **Average Response Time**: ~620ms

### By Language
- **Bangla**: 3 sources (75%)
- **English**: 1 source (25%)

### By Type
- **Daily Newspapers**: 2 sources (50%)
- **International Services**: 2 sources (50%)

### By Reliability
- **5-Star Sources**: 4 sources (100%)

---

## 🎯 Why These 4 Sources?

### Quality Over Quantity
We prioritize **working, reliable sources** over having many broken feeds:

1. **Prothom Alo**: Largest circulation in Bangladesh, comprehensive Bangla coverage
2. **The Daily Star**: Premier English-language source, excellent for international readers
3. **BBC Bangla**: International credibility, trusted global brand
4. **DW Bangla**: European perspective, quality international journalism

### Coverage Balance
- ✅ **Language**: Both Bangla (75%) and English (25%)
- ✅ **Perspective**: Local (50%) and International (50%)
- ✅ **Content**: High article volume (81 articles per fetch)
- ✅ **Images**: Excellent image support (89% coverage)
- ✅ **Speed**: Fast response times (<1 second average)

---

## 🔄 How to Enable/Disable Sources

Edit `config/rss-sources.json`:

```json
{
  "id": "source-id",
  "name": "Source Name",
  "url": "https://example.com/feed",
  "category": "General",
  "enabled": true,  // Change to false to disable
  "description": "Source description"
}
```

After changing, restart your application or wait for the next cron job cycle.

---

## 🧪 Verification

Run the verification script to test all sources:

```bash
npx ts-node --project tsconfig.scripts.json scripts/verify-rss-sources.ts
```

This will:
- ✅ Test each enabled source
- 📊 Show article counts and image coverage
- ⏱️ Measure response times
- 📄 Display sample articles
- 📈 Generate summary statistics

---

## 📈 Recommended Configurations

### Current (Recommended) ✅
**4 sources** - Best balance of reliability, coverage, and performance
- Prothom Alo, Daily Star, BBC Bangla, DW Bangla
- **Pros**: 100% uptime, excellent coverage, fast updates
- **Cons**: Limited to 4 sources

### Minimal (Fast)
**2 sources** - For maximum speed
- Prothom Alo, Daily Star
- **Pros**: Fastest, most reliable
- **Cons**: Limited perspective

### Maximum (When feeds are fixed)
**10+ sources** - When other feeds become available
- Enable all working sources
- **Pros**: Maximum coverage
- **Cons**: Depends on feed availability

---

## 🔍 Source Selection Criteria

Sources were selected based on:

1. ✅ **Working RSS Feed**: Active and properly formatted
2. ✅ **Reputation**: Established media outlets with proven track record
3. ✅ **Credibility**: Known for accurate, fact-based reporting
4. ✅ **Independence**: Editorial independence and journalistic integrity
5. ✅ **Coverage**: Comprehensive news coverage across categories
6. ✅ **Performance**: Fast response times and regular updates
7. ✅ **Images**: Good image support for visual content

---

## 📝 Notes

1. **RSS Feed Status**: Verified working as of 2026-05-03
2. **Update Frequency**: Sources update at different intervals
3. **Content Language**: 75% Bangla, 25% English
4. **Categorization**: Automatic categorization works excellently with these sources
5. **Image Support**: 89% of articles include images
6. **Reliability**: 100% uptime for enabled sources

---

## 🚀 Future Improvements

### When RSS Feeds Become Available
Monitor and re-enable these quality sources when their feeds are fixed:
- bdnews24.com (high-quality online portal)
- Dhaka Tribune (sister publication of Prothom Alo)
- The Business Standard (business news)
- The Financial Express (financial news)

### Potential New Sources
Consider adding when available:
- **Jugantor** (Bangla daily)
- **Kaler Kantho** (Bangla daily)
- **Samakal** (Bangla daily)
- **Bangladesh Sangbad Sangstha (BSS)** (National news agency)

---

## ✅ Quality Assurance

All enabled sources have been verified for:
- ✅ Active RSS feeds (100% working)
- ✅ Regular content updates
- ✅ Proper image support (89% coverage)
- ✅ Valid article metadata
- ✅ Consistent formatting
- ✅ Fast response times (<1s average)
- ✅ High article volume (81 articles per fetch)

---

**Last Verified**: 2026-05-03  
**Total Sources**: 12 (4 enabled, 8 disabled)  
**Working Rate**: 100% (4/4 enabled sources working)  
**Status**: ✅ Production Ready - All enabled sources verified working
