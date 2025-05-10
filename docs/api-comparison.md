# Game API Comparison: RAWG vs IGDB

This document compares two popular game information APIs to determine which is the best fit for the BZGamers project.

## RAWG API

### Overview
RAWG is one of the largest video game databases with over 500,000 games across all platforms. It provides a RESTful API with comprehensive game data.

### Features
- **Game Data**: Extensive information including titles, descriptions, release dates, platforms, genres, tags, ratings, screenshots, and more
- **Search & Filtering**: Powerful search capabilities with multiple filtering options
- **Platforms**: Covers all major gaming platforms (PC, consoles, mobile)
- **Community Data**: User ratings and reviews
- **Updates**: Regular database updates with new releases

### Pricing
- **Free Tier**: 20,000 requests per month
- **Pro Tier**: $49/month for 100,000 requests
- **Business Tier**: Custom pricing for higher volumes

### Authentication
- API key required for all requests
- Simple key-based authentication

### Documentation
- Well-documented API with clear examples
- Documentation URL: https://api.rawg.io/docs/

### Pros
- Large database of games
- Simple API structure
- Good free tier for development
- Excellent documentation
- Active development and updates

### Cons
- Limited data on some niche or indie games
- Rate limits on free tier
- Less detailed data compared to IGDB in some areas

## IGDB API (Twitch)

### Overview
IGDB (Internet Game Database) is now owned by Twitch/Amazon and provides detailed information about video games through its API.

### Features
- **Game Data**: Comprehensive information including titles, summaries, storylines, release dates, age ratings, genres, themes, and more
- **Media**: Screenshots, artwork, videos
- **Advanced Queries**: Powerful query language (Apicalypse) for complex filtering
- **Related Data**: Companies, game engines, franchises, collections
- **Community Data**: Ratings, reviews, follows, and hype levels

### Pricing
- **Free Tier**: 4 requests per second, no monthly limit (Twitch Developer account required)
- **Commercial Usage**: Requires approval from Twitch

### Authentication
- Requires Twitch Developer account
- OAuth 2.0 authentication flow
- Client ID and secret required

### Documentation
- Detailed documentation with API explorer
- Documentation URL: https://api-docs.igdb.com/

### Pros
- Very detailed game information
- Powerful query language
- No monthly request limit (only rate limiting)
- Part of Twitch ecosystem (potential for integrations)
- Comprehensive metadata

### Cons
- More complex authentication process
- Learning curve for query language
- Commercial usage requires approval
- Owned by Amazon/Twitch (potential future policy changes)

## Comparison Table

| Feature | RAWG | IGDB |
|---------|------|------|
| Database Size | 500,000+ games | 200,000+ games |
| API Type | REST | REST with custom query language |
| Free Tier | 20,000 requests/month | 4 requests/second (no monthly limit) |
| Authentication | Simple API key | OAuth 2.0 via Twitch |
| Data Depth | Good | Excellent |
| Ease of Use | High | Medium (due to query language) |
| Documentation | Excellent | Excellent |
| Commercial Usage | Paid tiers available | Requires approval |
| Community Data | Yes | Yes (more detailed) |

## Recommendation for BZGamers

Based on our project requirements:

**Initial Recommendation: RAWG API**

Reasons:
1. **Simpler Integration**: Easier to implement quickly for MVP
2. **Sufficient Data**: Provides all the necessary data for mood-based game matching
3. **Free Tier Adequacy**: 20,000 requests/month should be sufficient for initial development and early user base
4. **Straightforward Authentication**: Simple API key makes development faster

However, if we anticipate needing more detailed game information or expect to exceed the free tier limits quickly, IGDB might be the better long-term choice despite its steeper learning curve.

## Next Steps

1. Create test accounts for both APIs
2. Perform sample queries to verify data quality for our specific needs
3. Test response times and reliability
4. Make final decision based on test results

## API Registration Links

- RAWG API: https://rawg.io/apidocs
- IGDB API: https://api-docs.igdb.com/#getting-started
