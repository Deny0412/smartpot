#include <twr.h>
#include <twr_module_relay.h>

#define ADC_MEASUREMENT_INTERVAL_MS (10 * 1000)
#define BATTERY_MEASUREMENT_INTERVAL_MS (60 * 60 * 1000)
#define TEMPERATURE_MEASUREMENT_INTERVAL_MS (60 * 1000)
#define PUMP_ON_TIME_MS 5000

twr_led_t led;
twr_button_t button;
twr_tmp112_t tmp112;
static twr_module_relay_t relay;

float adc_values[3];
float soil_humidity = 0;
float soil_humidity_percent = 0;
float water_level_voltage = 0;
float light_voltage = 0;
float light_percent = 0;

twr_scheduler_task_id_t pump_task_id;
bool pump_on = false;
bool pump_active_mode = false; // pro rychlé měření během pumpování

typedef enum
{
    STATE_POWER_ON,
    STATE_MEASURE_CHANNEL_A,
    STATE_MEASURE_CHANNEL_B,
    STATE_MEASURE_CHANNEL_LIGHT,
    STATE_POWER_OFF
} app_state_t;

app_state_t app_state = STATE_POWER_ON;

#define ADC_CHANNEL_A 0
#define ADC_CHANNEL_B 1
#define ADC_CHANNEL_LIGHT 2

void radio_callback(uint64_t *id, const char *topic, void *value, void *param)
{
    int state = *(int *)value;

    twr_log_info("RECEIVED [%s] = %d", topic, state);

    if (state == 1)
    {
        twr_module_relay_set_state(&relay, false);
        pump_on = true;
        pump_active_mode = true;
        twr_log_info("Pump ON (from gateway)");
        twr_radio_pub_string("log", "Pump ON (from gateway)");
        twr_scheduler_plan_now(0);
        twr_scheduler_plan_relative(pump_task_id, PUMP_ON_TIME_MS);
    }
    else
    {
        twr_module_relay_set_state(&relay, true);
        pump_on = false;
        pump_active_mode = false;
        twr_log_info("Pump OFF (from gateway)");
        twr_radio_pub_string("log", "Pump OFF (from gateway)");
    }
}

static const twr_radio_sub_t subs[] = {
    { "pump/-/set/state", TWR_RADIO_SUB_PT_INT, radio_callback, NULL }
};

void tmp112_event_handler(twr_tmp112_t *self, twr_tmp112_event_t event, void *event_param)
{
    if (event == TWR_TMP112_EVENT_UPDATE)
    {
        float temperature;
        if (twr_tmp112_get_temperature_celsius(self, &temperature))
        {
            twr_log_info("APP: Temperature = %.1f °C", temperature);
            twr_radio_pub_temperature(TWR_RADIO_PUB_CHANNEL_R1_I2C0_ADDRESS_ALTERNATE, &temperature);
        }
    }
    else if (event == TWR_TMP112_EVENT_ERROR)
    {
        twr_log_error("APP: Thermometer error");
    }
}

void pump_task(void *param)
{
    if (!pump_on) return;

    twr_module_relay_set_state(&relay, true);
    pump_on = false;
    pump_active_mode = false;
    twr_log_info("APP: Pump OFF");
    twr_radio_pub_string("log", "Pump OFF");

    // po vypnutí pumpy hned změř a odešli data
    twr_scheduler_plan_now(0);
}

void button_event_handler(twr_button_t *self, twr_button_event_t event, void *event_param)
{
    if (event == TWR_BUTTON_EVENT_CLICK && !pump_on)
    {
        twr_module_relay_set_state(&relay, false);
        pump_on = true;
        pump_active_mode = true;
        twr_log_info("APP: Pump ON (button)");
        twr_radio_pub_string("log", "Pump ON (button)");
        twr_scheduler_plan_relative(pump_task_id, PUMP_ON_TIME_MS);
    }
    else if (event == TWR_BUTTON_EVENT_HOLD)
    {
        twr_log_info("APP: Button held for 5s");
        twr_radio_pub_string("reset", "needed reset household for smartpot");
        twr_led_pulse(&led, 1000);
    }
}

void battery_event_handler(twr_module_battery_event_t event, void *event_param)
{
    if (event == TWR_MODULE_BATTERY_EVENT_UPDATE)
    {
        float voltage;
        if (twr_module_battery_get_voltage(&voltage))
        {
            twr_log_info("APP: Battery voltage = %.2f V", voltage);
            twr_radio_pub_battery(&voltage);
        }
    }
}

void adc_event_handler(twr_adc_channel_t channel, twr_adc_event_t event, void *param)
{
    if (event == TWR_ADC_EVENT_DONE)
    {
        if (channel == TWR_ADC_CHANNEL_A4)
        {
            twr_adc_async_get_voltage(channel, &adc_values[ADC_CHANNEL_A]);
        }
        else if (channel == TWR_ADC_CHANNEL_A5)
        {
            twr_adc_async_get_voltage(channel, &adc_values[ADC_CHANNEL_B]);
        }
        else if (channel == TWR_ADC_CHANNEL_A3)
        {
            twr_adc_async_get_voltage(channel, &adc_values[ADC_CHANNEL_LIGHT]);
        }
    }
}

void application_init(void)
{
    twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);

    twr_led_init(&led, TWR_GPIO_LED, false, false);
    twr_led_pulse(&led, 500);

    twr_button_init(&button, TWR_GPIO_BUTTON, TWR_GPIO_PULL_DOWN, false);
    twr_button_set_event_handler(&button, button_event_handler, NULL);
    twr_button_set_hold_time(&button, 5000); // 5s hold detection

    twr_module_battery_init();
    twr_module_battery_set_event_handler(battery_event_handler, NULL);
    twr_module_battery_set_update_interval(BATTERY_MEASUREMENT_INTERVAL_MS);

    twr_tmp112_init(&tmp112, TWR_I2C_I2C0, 0x49);
    twr_tmp112_set_event_handler(&tmp112, tmp112_event_handler, NULL);
    twr_tmp112_set_update_interval(&tmp112, TEMPERATURE_MEASUREMENT_INTERVAL_MS);

    twr_module_sensor_init();
    twr_adc_init();

    twr_gpio_init(TWR_GPIO_P1);

    twr_adc_set_event_handler(TWR_ADC_CHANNEL_A4, adc_event_handler, NULL);
    twr_adc_resolution_set(TWR_ADC_CHANNEL_A4, TWR_ADC_RESOLUTION_12_BIT);

    twr_adc_set_event_handler(TWR_ADC_CHANNEL_A5, adc_event_handler, NULL);
    twr_adc_resolution_set(TWR_ADC_CHANNEL_A5, TWR_ADC_RESOLUTION_12_BIT);

    twr_adc_set_event_handler(TWR_ADC_CHANNEL_A3, adc_event_handler, NULL);
    twr_adc_resolution_set(TWR_ADC_CHANNEL_A3, TWR_ADC_RESOLUTION_12_BIT);

    twr_radio_init(TWR_RADIO_MODE_NODE_SLEEPING);
    twr_radio_set_rx_timeout_for_sleeping_node(2000); // 2s příjem po pub
    twr_radio_set_subs((twr_radio_sub_t *)subs, sizeof(subs) / sizeof(subs[0]));
    twr_radio_pairing_request("core_module", FW_VERSION);

    twr_module_relay_init(&relay, TWR_MODULE_RELAY_I2C_ADDRESS_DEFAULT);
    pump_task_id = twr_scheduler_register(pump_task, NULL, TWR_TICK_INFINITY);

    twr_led_pulse(&led, 2000);
    twr_scheduler_plan_now(0);
}

void application_task(void)
{
    switch (app_state)
    {
        case STATE_POWER_ON:
            twr_led_pulse(&led, 100);
            twr_module_sensor_set_vdd(true);
            app_state = STATE_MEASURE_CHANNEL_A;
            twr_scheduler_plan_current_relative(50);
            break;

        case STATE_MEASURE_CHANNEL_A:
            twr_adc_async_measure(TWR_ADC_CHANNEL_A4);
            app_state = STATE_MEASURE_CHANNEL_B;
            twr_scheduler_plan_current_relative(50);
            break;

        case STATE_MEASURE_CHANNEL_B:
            twr_adc_async_measure(TWR_ADC_CHANNEL_A5);
            app_state = STATE_MEASURE_CHANNEL_LIGHT;
            twr_scheduler_plan_current_relative(50);
            break;

        case STATE_MEASURE_CHANNEL_LIGHT:
            twr_adc_async_measure(TWR_ADC_CHANNEL_A3);
            app_state = STATE_POWER_OFF;
            twr_scheduler_plan_current_relative(50);
            break;

        case STATE_POWER_OFF:
            twr_module_sensor_set_vdd(false);

            soil_humidity = adc_values[ADC_CHANNEL_A];
            water_level_voltage = adc_values[ADC_CHANNEL_B];
            light_voltage = adc_values[ADC_CHANNEL_LIGHT];

            soil_humidity_percent = (1.0f - (soil_humidity - 1.0f) / (3.3f - 1.0f)) * 100.0f;
            if (soil_humidity_percent > 100.0f) soil_humidity_percent = 100.0f;
            if (soil_humidity_percent < 0.0f) soil_humidity_percent = 0.0f;

            light_percent = (1.0f - (light_voltage / 3.3f)) * 100.0f;
            if (light_percent > 100.0f) light_percent = 100.0f;
            if (light_percent < 0.0f) light_percent = 0.0f;

            const char *water_level_status;

            if (water_level_voltage <= 1.5f)
            {
                water_level_status = "LOW";
            }
            else if (water_level_voltage <= 1.7f)
            {
                water_level_status = "MEDIUM";
            }
            else
            {
                water_level_status = "HIGH";
            }

            char msg[128];
            snprintf(msg, sizeof(msg), "soil=%.0f,light=%.0f,water=%s", soil_humidity_percent, light_percent, water_level_status);
            twr_radio_pub_string("data", msg);

            app_state = STATE_POWER_ON;

            if (pump_active_mode)
            {
                twr_scheduler_plan_current_relative(500); // každou 1 s při zalévání
            }
            else
            {
                twr_scheduler_plan_current_relative(ADC_MEASUREMENT_INTERVAL_MS);
            }
            break;

        default:
            break;
    }
}
