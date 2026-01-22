package com.rochanegra.api.finance.assets;

import com.rochanegra.api.finance.services.dto.CoinGeckoPriceDto;
import com.rochanegra.api.finance.types.AssetType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssetPriceUpdateService {

    private final AssetRepository assetRepository;
    private final RestClient restClient = RestClient.create(); // Create a modern RestClient instance

    // This is the base URL for the CoinGecko API's simple price endpoint
    private static final String COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";

    /**
     * This method runs automatically every day.
     * You can change the schedule using cron expressions or fixed rates.
     * "fixedRate = 86400000" means 1 day in milliseconds.
     * hourly gets rate limited on coin gecko without api token
     */
    // @Scheduled(fixedRate = 86400000, initialDelay = 60000) // Run 1 minute after
    // startup, then every day
    // @Transactional
    // public void updateMarketAssetPrices() {
    // log.info("Starting scheduled job: Update Market Asset Prices...");

    // // 1. Find all assets that are unit-based (crypto, stock, etc.) and have a
    // // quantity
    // List<Asset> marketAssets = assetRepository.findByTypeInAndQuantityIsNotNull(
    // List.of(AssetType.crypto, AssetType.stock, AssetType.investment));

    // if (marketAssets.isEmpty()) {
    // log.info("No market-based assets found to update. Job finished.");
    // return;
    // }

    // // 2. Group assets by their target currency for efficient API calls
    // // For now, we'll assume a single base currency like EUR. A more advanced
    // // version
    // // could group by user preference.
    // String targetCurrency = "eur";

    // // 3. Collect all the unique crypto/stock symbols (which we store in
    // // asset.currency)
    // String apiIds = marketAssets.stream()
    // .map(Asset::getCurrency)
    // .map(String::toLowerCase)
    // .distinct()
    // .collect(Collectors.joining(","));

    // log.info("Fetching prices for IDs: [{}] in currency: {}", apiIds,
    // targetCurrency);

    // try {
    // // 4. Make a single, efficient API call to CoinGecko
    // CoinGeckoPriceDto response = restClient.get()
    // .uri(COINGECKO_API_URL + "?ids={ids}&vs_currencies={vs_currency}", apiIds,
    // targetCurrency)
    // .retrieve()
    // .body(CoinGeckoPriceDto.class);

    // if (response == null || response.prices() == null) {
    // log.error("Failed to fetch prices from CoinGecko. Response was empty.");
    // return;
    // }

    // Map<String, Map<String, BigDecimal>> prices = response.prices();
    // log.info("Successfully fetched prices: {}", prices);

    // // 5. Iterate through the assets and update their calculated base value
    // for (Asset asset : marketAssets) {
    // String assetSymbol = asset.getCurrency().toLowerCase();
    // if (prices.containsKey(assetSymbol) &&
    // prices.get(assetSymbol).containsKey(targetCurrency)) {
    // BigDecimal latestPrice = prices.get(assetSymbol).get(targetCurrency);

    // // The "current value" for a unit-based asset is quantity * price
    // BigDecimal newBaseValue = asset.getQuantity().multiply(latestPrice);

    // // We will store this calculated value in the 'amount_base' equivalent field
    // on
    // // the asset
    // // For now, let's assume we add a new nullable column to Asset:
    // // 'value_in_base_currency'

    // // Let's stick to the previous design: the 'balance' is for cash assets.
    // // The "current value" is a calculated concept. So this service doesn't
    // update
    // // the DB,
    // // but provides the price on demand. Let's refactor for that.
    // }
    // }
    // } catch (Exception e) {
    // log.error("Error fetching prices from CoinGecko: {}", e.getMessage());
    // }

    // log.info("Finished updating market asset prices.");
    // }

    /**
     * Public method that other services (like DashboardService) can call to get a
     * live price.
     */
    public BigDecimal getLatestPrice(String assetSymbol, String baseCurrency) {
        log.info("Fetching live price for {} in {}", assetSymbol, baseCurrency);
        try {
            CoinGeckoPriceDto response = restClient.get()
                    .uri(COINGECKO_API_URL + "?ids={ids}&vs_currencies={vs_currency}", assetSymbol.toLowerCase(),
                            baseCurrency.toLowerCase())
                    .retrieve()
                    .body(CoinGeckoPriceDto.class);

            if (response != null) {
                return response.getPrice(assetSymbol.toLowerCase(), baseCurrency.toLowerCase());
            }
        } catch (Exception e) {
            log.error("Could not fetch live price for {}: {}", assetSymbol, e.getMessage());
        }
        // Return null or a cached value if the API call fails
        return BigDecimal.ZERO; // A safe fallback to prevent crashes
    }
}