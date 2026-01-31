# Extending the forecast by 5 years (to 2035) and keeping the current trend for both developers and bots

# Extend forecast years
extended_forecast_years = list(range(2024, 2036))

# Extend human developer forecast with a continued decline
extended_forecast_human = pronounced_forecast + [pronounced_forecast[-1] * 0.9**i for i in range(1, 6)]

# Extend bot forecast with continued growth
extended_bots_millions_pronounced = bots_millions_pronounced + [bots_millions_pronounced[-1] * 1.2**i for i in range(1, 6)]

# Smooth the entire extended range for human developers
x_combined_human = np.array(historical_years + extended_forecast_years)
y_combined_human = np.array(developers_millions + extended_forecast_human)
x_smooth_combined_human = np.linspace(x_combined_human.min(), x_combined_human.max(), 350)
y_smooth_combined_human = make_interp_spline(x_combined_human, y_combined_human, k=3)(x_smooth_combined_human)

# Smooth the extended bot data
x_bots_extended = np.array(extended_forecast_years)
y_bots_millions_pronounced_extended = np.array(extended_bots_millions_pronounced)

if len(x_bots_extended) >= 4:
    spline_bots_extended = make_interp_spline(x_bots_extended, y_bots_millions_pronounced_extended, k=3)
else:
    spline_bots_extended = make_interp_spline(x_bots_extended, y_bots_millions_pronounced_extended, k=1)

x_smooth_bots_extended = np.linspace(x_bots_extended.min(), x_bots_extended.max(), 200)
y_smooth_bots_extended = spline_bots_extended(x_smooth_bots_extended)

# Plotting the extended forecast with current trends
plt.figure(figsize=(12, 6))

# Plot human developers as a single smoothed area in millions (historical + forecast extended)
plt.fill_between(
    x_smooth_combined_human, y_smooth_combined_human,
    color="skyblue", alpha=0.4, label="Human Developers (Historical & Extended Forecast)"
)

# Plot bot data as a smoothed area in millions with extended growth
plt.fill_between(
    x_smooth_bots_extended, y_smooth_bots_extended,
    color="lightgreen", alpha=0.6, label="Estimated Bots Replacing Roles (Extended)"
)

# Chart title and labels
plt.title("US Software Developers vs. Estimated Bots Replacing Roles (2014-2035)", fontsize=14)
plt.xlabel("Year", fontsize=12)
plt.ylabel("Number (in millions)", fontsize=12)
plt.xticks(list(range(2014, 2036, 2)), rotation=45)  # Adjust x-ticks for readability

# Legend and grid
plt.legend(loc="upper left")
plt.grid(True, linestyle='--', alpha=0.7)

# Adjust layout and display
plt.tight_layout()
plt.show()