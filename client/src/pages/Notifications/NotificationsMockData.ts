const alertTypes = [
    'high_soil',
    'low_soil',
    'low_temperature',
    'high_temperature',
    'low_battery',
    'wifi_outage',
    'wifi_restored',
]

export const NotificationsMockData = {
    notifications: [
        {
            household_name: 'Kancelária Praha 6',
            alerts: [
                {
                    id: 1,
                    type: 'low_soil',
                    plant_name: 'Kvetináč 1',
                    timestamp: '2024-03-20T10:30:00Z',
                    message: 'Nízka hladina pôdy v Kvetináč 1',
                    is_read: false,
                },
                {
                    id: 2,
                    type: 'high_temperature',
                    plant_name: 'Kvetináč 2',
                    timestamp: '2024-03-20T09:15:00Z',
                    message: 'Vysoká teplota v Kvetináč 2',
                    is_read: true,
                },
                {
                    id: 3,
                    type: 'low_battery',
                    plant_name: 'Kvetináč 1',
                    timestamp: '2024-03-19T15:45:00Z',
                    message: 'Nízka batéria v Kvetináč 1',
                    is_read: false,
                },
            ],
        },
        {
            household_name: 'Household 2',
            alerts: [
                {
                    id: 4,
                    type: 'wifi_outage',
                    plant_name: 'Kvetináč 3',
                    timestamp: '2024-03-20T08:20:00Z',
                    message: 'Strata WiFi pripojenia v Kvetináč 3',
                    is_read: false,
                },
                {
                    id: 5,
                    type: 'wifi_restored',
                    plant_name: 'Kvetináč 3',
                    timestamp: '2024-03-20T08:35:00Z',
                    message: 'Obnovené WiFi pripojenie v Kvetináč 3',
                    is_read: true,
                },
            ],
        },
    ],
}
