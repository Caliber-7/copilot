import math
from typing import List, Dict, Any, Tuple
import numpy as np
from app.schemas.telemetry import CorrelationPair, TelemetryCorrelationResponse

class TelemetryCorrelationService:
    @staticmethod
    def calculate_pearson(x: List[float], y: List[float]) -> float:
        if len(x) < 2 or len(y) < 2 or len(x) != len(y):
            return 0.0
        x_arr = np.array(x, dtype=float)
        y_arr = np.array(y, dtype=float)

        std_x = np.std(x_arr)
        std_y = np.std(y_arr)
        if std_x == 0 or std_y == 0:
            return 0.0

        r = np.corrcoef(x_arr, y_arr)[0, 1]
        if math.isnan(r):
            return 0.0
        return float(round(r, 3))

    @staticmethod
    def find_optimal_lag(series_a: List[Tuple[float, float]], series_b: List[Tuple[float, float]]) -> Tuple[float, int]:
        """
        Calculates maximum correlation and corresponding time lag (in seconds)
        between two timestamped series: [(timestamp_epoch, value), ...]
        """
        if not series_a or not series_b:
            return 0.0, 0

        # Align timestamps to a common grid with 15-second resolution
        t_min = max(series_a[0][0], series_b[0][0])
        t_max = min(series_a[-1][0], series_b[-1][0])
        if t_max <= t_min:
            return 0.0, 0

        times = np.arange(t_min, t_max, 15.0)
        if len(times) < 4:
            return 0.0, 0

        # Interpolate values
        a_times, a_vals = zip(*series_a)
        b_times, b_vals = zip(*series_b)
        interp_a = np.interp(times, a_times, a_vals)
        interp_b = np.interp(times, b_times, b_vals)

        # Cross-correlate with lag window of -10 to +10 steps (-150s to +150s)
        best_r = 0.0
        best_lag = 0
        max_shift = min(10, len(times) // 2)

        for shift in range(-max_shift, max_shift + 1):
            if shift < 0:
                a_sub = interp_a[:shift]
                b_sub = interp_b[-shift:]
            elif shift > 0:
                a_sub = interp_a[shift:]
                b_sub = interp_b[:-shift]
            else:
                a_sub = interp_a
                b_sub = interp_b

            if len(a_sub) < 3:
                continue

            r = TelemetryCorrelationService.calculate_pearson(list(a_sub), list(b_sub))
            if abs(r) > abs(best_r):
                best_r = r
                best_lag = shift * 15 # seconds

        return round(best_r, 3), best_lag

    @staticmethod
    def analyze_correlations(parameter_series: Dict[str, List[Tuple[float, float]]]) -> List[CorrelationPair]:
        pairs: List[CorrelationPair] = []
        param_names = list(parameter_series.keys())

        for i in range(len(param_names)):
            for j in range(i + 1, len(param_names)):
                p_a = param_names[i]
                p_b = param_names[j]
                data_a = parameter_series[p_a]
                data_b = parameter_series[p_b]

                if len(data_a) < 3 or len(data_b) < 3:
                    continue

                r, lag_sec = TelemetryCorrelationService.find_optimal_lag(data_a, data_b)
                
                # Determine significance
                abs_r = abs(r)
                if abs_r >= 0.75:
                    significance = "HIGH"
                elif abs_r >= 0.45:
                    significance = "MODERATE"
                else:
                    significance = "LOW"

                # Categorize relationship
                if abs_r < 0.3:
                    rel = "Uncorrelated / Independent"
                elif lag_sec > 30:
                    rel = f"Lagging response ({p_a} leads {p_b} by ~{lag_sec}s)"
                elif lag_sec < -30:
                    rel = f"Leading response ({p_b} leads {p_a} by ~{-lag_sec}s)"
                elif r > 0.7:
                    rel = "Direct positive coupling (Synchronous)"
                elif r < -0.7:
                    rel = "Inverse coupling (Inverse behavior)"
                else:
                    rel = "Moderate association"

                pairs.append(CorrelationPair(
                    param_a=p_a,
                    param_b=p_b,
                    correlation_coefficient=r,
                    time_lag_seconds=abs(lag_sec),
                    significance=significance,
                    relationship=rel
                ))

        # Sort pairs by highest absolute correlation
        pairs.sort(key=lambda x: abs(x.correlation_coefficient), reverse=True)
        return pairs

correlation_service = TelemetryCorrelationService()
