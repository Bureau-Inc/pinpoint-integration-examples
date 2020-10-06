package id.bureau.auth;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkInfo;
import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Request;

import static android.content.Context.CONNECTIVITY_SERVICE;

public class BureauAuth {
    private final Mode mode;
    private final String clientId;
    private final String host;
    private final int timeoutInMs;
    private final String callbackUrl;

    BureauAuth(Mode mode, String clientId, int timeoutInMs, String callbackUrl) {
        if (null == mode) {
            this.mode = Mode.Production;
        } else {
            this.mode = mode;
        }
        switch (mode) {
            case Sandbox:
                host = "api.sandbox.bureau.id";
                break;
            default:
                host = "api.bureau.id";
                break;
        }
        this.clientId = clientId;
        if (timeoutInMs < 1) {
            this.timeoutInMs = 25 * 100; //2.5sec
        } else {
            this.timeoutInMs = timeoutInMs;
        }
        callbackUrl = null == callbackUrl ? null : callbackUrl.trim();
        this.callbackUrl = null == callbackUrl ? null : callbackUrl.length() == 0 ? null : callbackUrl;
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public boolean authenticate(Context context, final String correlationId, final long mobileNumber) {
        try {
            Network mobileNetwork = getMobileNetwork(context);
            if (mobileNetwork == null) {
                String msg=  "Mobile network is not available";
                Log.i("BureauAuth", msg);
                throw new NetworkNotFoundException(msg);
            }
            OkHttpClient okHttpClient = buildHttpClient(mobileNetwork);
            triggerInitiateFlow(correlationId, mobileNumber, okHttpClient);
            triggerFinalizeFlow(correlationId, okHttpClient);
            return true;
        } catch (IOException e) {
            Log.i("BureauAuth", e.getMessage());
            throw new AuthenticationException("Unable to proceed with the authentication");
        } catch (IllegalStateException e) {
            Log.i("BureauAuth", e.getMessage());
            throw new AuthenticationException("Unable to proceed with the authentication");
        } catch (IllegalArgumentException e) {
            Log.i("BureauAuth", e.getMessage());
            throw new AuthenticationException("Unable to proceed with the authentication");
        } catch (SecurityException e) {
            Log.i("BureauAuth", e.getMessage());
            throw new AuthenticationException("Unable to proceed with the authentication");
        } catch (RuntimeException e) {
            Log.i("BureauAuth", e.getMessage());
            throw new AuthenticationException("Unable to proceed with the authentication");
        }
    }

    private void triggerFinalizeFlow(String correlationId, OkHttpClient okHttpClient) throws IOException {
        HttpUrl url = buildFinalizeUrl(correlationId);
        triggerFlow(url, okHttpClient);
    }

    private void triggerInitiateFlow(String correlationId, long mobileNumber, OkHttpClient okHttpClient) throws IOException {
        HttpUrl url = buildInititateUrl(correlationId, mobileNumber);
        triggerFlow(url, okHttpClient);
    }

    private void triggerFlow(HttpUrl url, OkHttpClient okHttpClient) throws IOException {
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
        Call call = okHttpClient.newCall(request);
        call.execute();
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    private Network getMobileNetwork(Context context) {
        ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(CONNECTIVITY_SERVICE);
        Network[] networks = connectivityManager.getAllNetworks();
        Network mobileNetwork = null;
        for (final Network network : networks) {
            final NetworkInfo netInfo = connectivityManager.getNetworkInfo(network);
            if (netInfo.getType() == ConnectivityManager.TYPE_MOBILE && netInfo.getState() == NetworkInfo.State.CONNECTED) {
                mobileNetwork = network;
                break;
            }
        }
        return mobileNetwork;
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    private OkHttpClient buildHttpClient(Network network) {
        return new OkHttpClient.Builder()
                .followRedirects(true)
                .followSslRedirects(true)
                .socketFactory(network.getSocketFactory())
                .connectTimeout(timeoutInMs, TimeUnit.MILLISECONDS)
                .writeTimeout(timeoutInMs, TimeUnit.MILLISECONDS)
                .readTimeout(timeoutInMs, TimeUnit.MILLISECONDS)
                .build();
    }

    private HttpUrl buildInititateUrl(String correlationId, long mobileNumber) {
        return new HttpUrl.Builder()
                .scheme("https")
                .host(host)
                .addPathSegments("v2/auth/initiate")
                .addQueryParameter("clientId", clientId)
                .addQueryParameter("correlationId", correlationId)
                .addQueryParameter("callbackUrl", callbackUrl)
                .addQueryParameter("msisdn", String.valueOf(mobileNumber))
                .build();
    }

    private HttpUrl buildFinalizeUrl(String correlationId) {
        return new HttpUrl.Builder()
                .scheme("https")
                .host(host)
                .addPathSegments("v2/auth/finalize")
                .addQueryParameter("clientId", clientId)
                .addQueryParameter("correlationId", correlationId)
                .build();
    }

    public static enum Mode {
        Sandbox, Production
    }

    public static class Builder {
        private Mode mode;
        private String clientId;
        private int timeOutInMs;
        private String callbackUrl;

        public Builder mode(Mode mode) {
            this.mode = mode;
            return this;
        }

        public Builder clientId(String clientId) {
            this.clientId = clientId;
            return this;
        }

        public Builder timeOutInMs(int timeOutInMs) {
            this.timeOutInMs = timeOutInMs;
            return this;
        }

        public Builder callbackUrl(String callbackUrl) {
            this.callbackUrl = callbackUrl;
            return this;
        }

        public BureauAuth build() {
            return new BureauAuth(mode, clientId, timeOutInMs, callbackUrl);
        }
    }

    public static class AuthenticationException extends RuntimeException {
        private String message;

        public AuthenticationException(String message) {
            this.message = message;
        }

        @Override
        public String getMessage() {
            return message;
        }
    }

    public static class NetworkNotFoundException extends RuntimeException {
        private String message;

        public NetworkNotFoundException(String message) {
            this.message = message;
        }

        @Override
        public String getMessage() {
            return message;
        }
    }

}
