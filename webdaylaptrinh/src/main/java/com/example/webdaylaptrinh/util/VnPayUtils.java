package com.example.webdaylaptrinh.util;

import lombok.experimental.UtilityClass;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.TreeMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@UtilityClass
public class VnPayUtils {

    public static Map<String, String> sortedParams(Map<String, String> params) {
        Map<String, String> result = new TreeMap<>();
        params.forEach((key, value) -> {
            if (value != null && !value.isEmpty()) {
                result.put(key, value);
            }
        });
        return result;
    }

    public static String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot generate VNPay signature", e);
        }
    }

    public static String buildQuery(Map<String, String> params) {
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            query.append(encode(entry.getKey()));
            query.append('=');
            query.append(encode(entry.getValue()));
            query.append('&');
        }
        query.deleteCharAt(query.length() - 1);
        return query.toString();
    }

    public static boolean secureCompare(String first, String second) {
        return MessageDigest.isEqual(first.getBytes(StandardCharsets.UTF_8), second.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Encode URL according to UTF-8 URL encoding standard for VNPay.
     * Special rules:
     * - space → %20 (not +)
     * - : → %3A
     * - / → %2F
     * - ~ remains as ~ (not %7E)
     * - * → %2A
     * 
     * This is especially important for vnp_ReturnUrl and vnp_OrderInfo.
     */
    private static String encode(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.toString())
                    .replace("+", "%20")  // space must be %20, not +
                    .replace("%7E", "~")  // keep ~ as is
                    .replace("*", "%2A"); // * must be %2A
        } catch (UnsupportedEncodingException e) {
            throw new IllegalStateException("Error encoding VNPay data", e);
        }
    }
}

