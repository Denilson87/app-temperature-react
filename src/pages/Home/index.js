import React, { useState, useEffect } from 'react'
import {
    Paper, FormControl, MenuItem, TextField, Typography,
    ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Fab
} from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import FavoriteIcon from '@material-ui/icons/Favorite'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, LabelList, ResponsiveContainer,
} from 'recharts';
import { PageArea } from './styled'
import WeatherIcon from 'react-icons-weather'
import cities from 'cities.json'
import useApi from '../../helpers/APIs'
import { PageContainer } from '../../components/MainComponents'

const Home = () => {

    const api = useApi()
    const [stateLoc, setStateLoc] = useState([])
    const [city, setCity] = useState([])
    const [idUf, setIdUf] = useState('')
    const [selectCity, setSelectCity] = useState('')
    const [weatherCity, setWeatherCity] = useState([])
    const [result, setResult] = useState(true)
    const [forecast, setForecast] = useState([])
    const [favorite, setFavorite] = useState([])
    const [expanded, setExpanded] = useState(false);
    const [verify, setVerify] = useState(false)
    const [chart, setChart] = useState([])


    useEffect(() => {
        const getStates = async () => {
            const slist = await api.getStates()
            setStateLoc(slist)
        }
        getStates()
    }, [])

    useEffect(() => {
        const getCity = async (idUf) => {
            const clist = await api.getCity(idUf)
            setCity(clist)
        }
        getCity(idUf)
    }, [idUf])

    useEffect(() => {
      
        if (selectCity === '') {
            return
        } else {
//             setselectCity(selectCity.charAt(0).toUpperCase());
            const latlng = cities.filter(d => d.name === selectCity)
            if (latlng.length === 0) {
                alert("Erro! a primeira letra da cidade deve ser mamaiuscula!")
            } else {
                const lat = latlng[0]['lat']
                const lng = latlng[0]['lng']
                const getWeatherCity = async (lat, lng) => {
                    const cityW = await api.getWeatherCity(lat, lng)
                    setWeatherCity(cityW)
                    setResult(false)
                }
                getWeatherCity(lat, lng)
            }
        }
    }, [selectCity])

    useEffect(() => {
        if (weatherCity.length === 0) {
            return
        }
        else {
            const newArray = weatherCity.daily.data.filter((i, k) => k > 0)
            setForecast(newArray)
        }
    }, [weatherCity, selectCity])

    useEffect(() => {
        if (localStorage.length === 0) {
            return
        } else {
            setFavorite(JSON.parse(localStorage.getItem('cities')))
        }
    }, [])

    useEffect(() => {
        setVerify(false)
        if (favorite.length === 0) {
            return
        } else {
            const favor = favorite.filter((i, k) => i.city === selectCity)
            if (favor.length === 0) {
                return
            } else {
                setVerify(true)
            }
        }
    }, [selectCity, favorite])

    useEffect(() => {
        if (forecast.length === 0) {
            return
        }
        else {

            let data = forecast.map((i) => {
                return {
                    day: formatDay(i.time),
                    Max: parseInt(i.temperatureHigh),
                    Min: parseInt(i.temperatureLow),
                }
            })
            setChart(data)
        }
    }, [forecast])

    const formatDate = (date) => {
        let cDate = new Date(date * 1000)

        let months = ['janeiro', 'fevereiro', 'mar??o',
            'abril', 'maio', 'junho', 'julho',
            'agosto', 'setembro', 'outubro',
            'novembro', 'dezembro']

        let dayWeek = ['Domingo', 'Segunda-feira', 'Ter??a-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'S??bado']

        let cDay = cDate.getDate()
        let cDayWeek = cDate.getDay()
        let cMonth = cDate.getMonth()
        let cYear = cDate.getFullYear()

        return `${dayWeek[cDayWeek]}, ${cDay} de ${months[cMonth]} de ${cYear}`
    }

    const formatDay = (date) => {
        let cDate = new Date(date * 1000)

        let dayWeek = ['Domingo', 'Segunda', 'Ter??a', 'Quarta', 'Quinta', 'Sexta', 'S??bado']
        let cDayWeek = cDate.getDay()

        return `${dayWeek[cDayWeek]}`
    }

    const handleChange = panel => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const addFav = () => {
        if (localStorage.length === 0) {
            var citiesFav =
                [
                    { city: selectCity }
                ]
                ;

            localStorage.cities = JSON.stringify(citiesFav)
        } else {
            var addCity = JSON.parse(localStorage.getItem('cities'))
            addCity.push({
                city: selectCity
            })
            localStorage.cities = JSON.stringify(addCity)
        }
        setVerify(true)
    }

    const removeFav = () => {
        const index = favorite.findIndex((i, k) => i.city === selectCity)
        favorite.splice(index, 1)
        localStorage.clear()
        localStorage.cities = JSON.stringify(favorite)
        setVerify(false)
    }

    const InfoTips = () => {
        if (weatherCity.currently.icon === 'rain' && (formatDay(weatherCity.currently.time) === 'S??bado' || formatDay(weatherCity.currently.time) === 'Domingo')) {
            let weekendRain = 'Ola Denilson! ?? final de semana. o dia n??o parece muito bonito. Fique em casa e previna se da covid-19!'
            return weekendRain
        }
        else if (weatherCity.currently.icon !== 'rain' && (formatDay(weatherCity.currently.time) === 'S??bado' || formatDay(weatherCity.currently.time) === 'Domingo')) {
            let weekendGood = 'Denilson! ?? final de semana. Aproveite que o dia est?? sem previs??o de chuva!'
            return weekendGood
        }
        else if (weatherCity.currently.icon === 'rain' && (formatDay(weatherCity.currently.time) !== 'S??bado' || formatDay(weatherCity.currently.time) !== 'Domingo')) {
            let weekRain = 'Parece que vai chover. N??o esque??a de levar o guarda-chuva'
            return weekRain
        }
        else if (weatherCity.currently.icon !== 'rain' && (formatDay(weatherCity.currently.time) !== 'S??bado' || formatDay(weatherCity.currently.time) !== 'Domingo')) {
            let weekGood = ' Sem previs??o de chuva. Aproveite e lave os lencois'
            return weekGood
        }
    }

    stateLoc.sort((a, b) => {
        return (a.nome > b.nome) ? 1 : ((b.nome > a.nome) ? -1 : 0);
    })

    return (
        <PageArea>
            <PageContainer>
                <Paper className="paper--search" position="static" color="inherit">
                    <Autocomplete
                        className="select--city"
                        options={city.map(option => option.nome)}
                        freeSolo
                        value={city.nome}
                        onChange={(e, newValue) => {
                            setSelectCity(newValue)
                        }}
                        renderInput={params => (
                            <TextField {...params} label="Cidades" margin="dense" fullWidth />
                        )}
                    />
                </Paper >
                <Paper className="favorite--area">
                    <FormControl className="select--favorite">
                        <TextField
                            select
                            label="Cidades Favoritas"
                            variant="outlined"
                            onChange={e => setSelectCity(e.target.value)}
                        >
                            {favorite.map((i, k) =>
                                <MenuItem key={k} value={i.city}>{i.city}</MenuItem>
                            )}
                        </TextField>
                    </FormControl>
                </Paper>
                {!result &&
                    <Paper className="result--area">
                        <div className="result--info">
                            <Typography className="city" variant="h4">
                                {selectCity}
                            </Typography>
                            <Typography variant="h3">
                                <WeatherIcon className="icon" name="darksky" iconId={weatherCity.currently.icon} flip="horizontal" rotate="90" />
                                <span className="temp">{parseInt(weatherCity.currently.temperature)} ??C</span>
                            </Typography>
                            <Typography className="summary" variant="h6">
                                {weatherCity.currently.summary}
                            </Typography>
                        </div>
                        <div className="result--other--info">
                            <ul>
                                <li>Sensa????o {parseInt(weatherCity.currently.apparentTemperature)}??C</li>
                                <li>Umidade {parseInt(weatherCity.currently.humidity * 100)}%</li>
                                <li>Vento {parseInt(weatherCity.currently.windSpeed)} km/h</li>
                                <li>Chuva {(parseInt(weatherCity.currently.precipProbability * 100))}%</li>
                            </ul>
                        </div>
                        {verify &&
                            <div className="favorite--button">
                                <Fab onClick={removeFav} color="secondary">
                                    <FavoriteIcon />
                                </Fab>
                            </div>
                        }
                        {!verify &&
                            <div className="favorite--button">
                                <Fab onClick={addFav}>
                                    <FavoriteIcon color="disabled" />
                                </Fab>
                            </div>
                        }
                        <div className="infoTips">
                            <Typography variant="h6" align="center">{InfoTips()}</Typography>
                        </div>
                        <Paper className="result--forecast">
                            <Typography className="title--forecast" variant="h5" align="center">Previs??o para os pr??ximos dias</Typography>
                            {forecast.map((i, k) =>
                                <ExpansionPanel expanded={expanded === i} onChange={handleChange(i)}>
                                    <ExpansionPanelSummary
                                        expandIcon={<ExpandMoreIcon />}
                                    >
                                        <div className="expand--false">
                                            <Typography className="forecast--date">{formatDate(i.time)}</Typography>
                                            <Typography variant="h6" className="temp--max--min" color="primary">
                                                <WeatherIcon className="icon" name="darksky" iconId={i.icon} flip="horizontal" rotate="90" />
                                                <span>M??xima {parseInt(i.temperatureHigh)} ??C</span>
                                                <span>M??nima {parseInt(i.temperatureLow)} ??C</span>
                                            </Typography>
                                        </div>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                        <div className="expand--true">
                                            <Typography className="summary--forecast" variant="h6" align="center">
                                                {i.summary}
                                            </Typography>
                                            <ul>
                                                <li>Sensa????o M??x. {parseInt(i.apparentTemperatureHigh)}??C</li>
                                                <li>Sensa????o Min. {parseInt(i.apparentTemperatureLow)}??C</li>
                                                <li>Umidade {parseInt(i.humidity * 100)}%</li>
                                                <li>Vento {parseInt(i.windSpeed)} km/h</li>
                                                <li>Chuva {(parseInt(i.precipProbability * 100))}%</li>
                                            </ul>
                                        </div>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            )}
                        </Paper>
                        <Paper align="center">
                            <Typography className="title--chart" variant="h6" align="center">
                               Confira a varia????o da temperatura para os proximos dias
                            </Typography>
                            <div className="chart--area">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={chart}
                                        margin={{
                                            top: 40, bottom: 40, right: 50
                                        }}
                                    >
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ bottom: 15 }} />
                                        <Line type="monotone" dataKey="Max" stroke="#8884d8" >
                                            <LabelList dataKey="Max" position="insideBottomLeft" />
                                        </Line>
                                        <Line type="monotone" dataKey="Min" stroke="#82ca9d" >
                                            <LabelList dataKey="Min" position="insideTopLeft" />
                                        </Line>
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Paper>
                    </Paper>
                }
            </PageContainer>
        </PageArea >
    )
}

export default Home
