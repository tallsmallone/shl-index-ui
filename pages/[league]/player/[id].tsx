import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import Error from 'next/error';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { PulseLoader } from 'react-spinners';
import styled from 'styled-components';

import { Team } from '../../..';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import SingleGoalieRatingsTable from '../../../components/RatingsTable/SingleGoalieRatingsTable';
import SinglePlayerRatingsTable from '../../../components/RatingsTable/SingleSkaterRatingsTable';
import SingleGoalieScoreTable from '../../../components/ScoreTable/SingleGoalieScoreTable';
import SingleSkaterAdvStatsTable from '../../../components/ScoreTable/SingleSkaterAdvStatsTable';
import SingleSkaterScoreTable from '../../../components/ScoreTable/SingleSkaterScoreTable';
import SeasonTypeSelector from '../../../components/Selector/SeasonTypeSelector';
import useGoalieInfo from '../../../hooks/useGoalieInfo';
import useGoalieRatingsId from '../../../hooks/useGoalieRatingsId';
import useGoalieStatsId from '../../../hooks/useGoalieStatsId';
import useRatingsId from '../../../hooks/useRatingsId';
import useSkaterInfo from '../../../hooks/useSkaterInfo';
import useSkaterStatsId from '../../../hooks/useSkaterStatsId';
import { SeasonType } from '../../api/v1/players/stats';

interface Props {
  league: string;
  teamList: Array<Team>;
  id: number;
}
function PlayerPage({ league, teamList, id }: Props): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSkater, setIsSkater] = useState<boolean>(true);
  const [playerError, setPlayerError] = useState<boolean>(false);
  const [filterSeasonType, setFilterSeasonType] = useState('Regular Season');

  // player info
  const [playerName, setPlayerName] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');
  const [playerTeam, setPlayerTeam] = useState('');
  const [playerWeight, setPlayerWeight] = useState('');
  const [playerHeight, setPlayerHeight] = useState('');

  // team image
  const [logo, setLogo] = useState('');

  // ratings
  const {
    ratings: goalieRatings,
    isLoading: isLoadingGoalieRating,
    isError: isErrorGoalieRating,
  } = useGoalieRatingsId(id, league);

  const {
    ratings: skaterRatings,
    isLoading: isLoadingPlayerRating,
    isError: isErrorPlayerRating,
  } = useRatingsId(id, league);

  // stats
  const {
    ratings: goalieStats,
    isLoading: isLoadingGoalieStats,
    isError: isErrorGoalieStats,
  } = useGoalieStatsId(id, league, filterSeasonType);

  const {
    ratings: skaterStats,
    isLoading: isLoadingSkaterStats,
    isError: isErrorSkaterStats,
  } = useSkaterStatsId(id, league, filterSeasonType);

  // player info
  const {
    ratings: goalieInfo,
    isLoading: isLoadingGoalieInfo,
    isError: isErrorGoalieInfo,
  } = useGoalieInfo(id, league);

  const {
    ratings: skaterInfo,
    isLoading: isLoadingSkaterInfo,
    isError: isErrorSkaterInfo,
  } = useSkaterInfo(id, league);

  // wait for all loads to complete
  useEffect(() => {
    setIsLoading(
      isLoadingGoalieRating ||
        isLoadingPlayerRating ||
        isLoadingGoalieStats ||
        isLoadingSkaterStats ||
        isLoadingGoalieInfo ||
        isLoadingSkaterInfo
    );
    if (!isLoading) {
      if (
        isErrorGoalieRating ||
        isErrorPlayerRating ||
        isErrorGoalieStats ||
        isErrorSkaterStats ||
        isErrorSkaterInfo ||
        isErrorGoalieInfo
      ) {
        setPlayerError(true);
      } else {
        if (skaterStats && skaterStats.length > 0) {
          setIsSkater(true);
          setPlayerName(skaterStats[0].name);
          setPlayerPosition(skaterStats[0].position);
          setPlayerTeam(skaterStats[0].team.toString());
          setPlayerHeight(skaterInfo[0].height.toString());
          setPlayerWeight(skaterInfo[0].weight.toString());
        } else {
          if (goalieStats && goalieStats.length > 0) {
            setIsSkater(false);
            setPlayerName(goalieStats[0].name);
            setPlayerPosition('G');
            setPlayerTeam(goalieStats[0].team.toString());
            setPlayerHeight(goalieInfo[0].height.toString());
            setPlayerWeight(goalieInfo[0].weight.toString());
          }
        }
      }
      if (playerTeam) {
        const location = teamList.find((team) => {
          if (team.abbreviation.toUpperCase() === playerTeam.toUpperCase()) {
            return true;
          }
        }).location;
        setLogo(
          require(`../../../public/team_logos/${league.toUpperCase()}/${location
            .replace('.', '')
            .replace(/white|blue/i, '')
            .trim()
            .split(' ')
            .join('_')}.svg`)
        );
      }
    }
  }, [
    isLoadingGoalieRating,
    isLoadingPlayerRating,
    isLoadingGoalieStats,
    isLoadingSkaterStats,
    isLoadingGoalieInfo,
    isLoadingSkaterInfo,
    skaterStats,
    skaterInfo,
    goalieStats,
    goalieInfo,
    isLoading,
    playerTeam,
  ]);

  const onSeasonTypeSelect = async (seasonType: SeasonType) => {
    setFilterSeasonType(seasonType);
  };

  const [display, setDisplay] = useState('stats');

  if (
    skaterStats &&
    skaterStats.length === 0 &&
    goalieStats &&
    goalieStats.length === 0
  ) {
    return <Error statusCode={404} />;
  }

  return (
    <React.Fragment>
      <NextSeo
        title="Player"
        openGraph={{
          title: 'Player',
        }}
      />
      <Header league={league} activePage="players" isSticky={false} />
      <Container>
        {isLoading && !playerError && (
          <CenteredContent>
            <PulseLoader size={15} />
          </CenteredContent>
        )}
        <Main>
          {playerError && (
            <ErrorBlock>
              Failed to load player info. Please reload the page to try again.
            </ErrorBlock>
          )}
          <ControlWrapper>
            <SelectorWrapper>
              <SeasonTypeSelector onChange={onSeasonTypeSelect} />
            </SelectorWrapper>
          </ControlWrapper>
          {!isLoading && (
            <>
              <CenteredContent>
                <ImageWrapper>
                  {logo ? (
                    <Logo src={logo} />
                  ) : (
                    <Skeleton circle width={150} height={150} />
                  )}
                </ImageWrapper>{' '}
                <br />
                <PlayerInfo>
                  <PlayerName>{playerName}</PlayerName>
                  <br />
                  {playerPosition} | {playerHeight} in | {playerWeight} lbs |{' '}
                  {playerTeam}
                </PlayerInfo>
              </CenteredContent>
              <DisplaySelectContainer role="tablist">
                <DisplaySelectItem
                  onClick={() => setDisplay(() => 'stats')}
                  active={display === 'stats'}
                  tabIndex={0}
                  role="tab"
                  aria-selected={display === 'stats'}
                >
                  Stats
                </DisplaySelectItem>
                {isSkater === true && (
                  <DisplaySelectItem
                    onClick={() => setDisplay(() => '')}
                    active={display === ''}
                    tabIndex={0}
                    role="tab"
                    aria-selected={display === ''}
                  >
                    Adv Stats
                  </DisplaySelectItem>
                )}
                <DisplaySelectItem
                  onClick={() => setDisplay(() => 'ratings')}
                  active={display === 'ratings'}
                  tabIndex={0}
                  role="tab"
                  aria-selected={display === 'ratings'}
                >
                  Ratings
                </DisplaySelectItem>
              </DisplaySelectContainer>
              {isSkater === true ? (
                <>
                  {display === 'stats' ? (
                    <>
                      <TableHeading>Stats</TableHeading>
                      <TableWrapper>
                        <TableContainer>
                          {skaterStats && (
                            <SingleSkaterScoreTable data={skaterStats} />
                          )}
                        </TableContainer>
                      </TableWrapper>
                    </>
                  ) : display === '' ? (
                    <>
                      <TableHeading>Advanced Stats</TableHeading>
                      <TableWrapper>
                        <TableContainer>
                          {skaterStats && (
                            <SingleSkaterAdvStatsTable data={skaterStats} />
                          )}
                        </TableContainer>
                      </TableWrapper>
                    </>
                  ) : (
                    <>
                      <TableHeading>Ratings</TableHeading>
                      <TableWrapper>
                        <TableContainer>
                          <SinglePlayerRatingsTable data={skaterRatings} />
                        </TableContainer>
                      </TableWrapper>
                    </>
                  )}
                </>
              ) : display === 'stats' ? (
                <>
                  <TableHeading>Stats</TableHeading>
                  <TableWrapper>
                    <TableContainer>
                      {goalieStats && (
                        <SingleGoalieScoreTable data={goalieStats} />
                      )}
                    </TableContainer>
                  </TableWrapper>
                </>
              ) : (
                <>
                  <TableHeading>Ratings</TableHeading>
                  <TableWrapper>
                    <TableContainer>
                      <SingleGoalieRatingsTable data={goalieRatings} />
                    </TableContainer>
                  </TableWrapper>
                </>
              )}
            </>
          )}
        </Main>
      </Container>
      <Footer />
    </React.Fragment>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { league, id, season } = ctx.query;

    const leagueid = ['shl', 'smjhl', 'iihf', 'wjc'].indexOf(
      typeof league === 'string' ? league : 'shl'
    );

    const seasonParam = season ? `&season=${season}` : '';

    const teamlist = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/v1/teams?league=${leagueid}${seasonParam}`
    ).then((res) => res.json());

    return { props: { league: league, teamList: teamlist, id: id } };
  } catch (error) {
    ctx.res.statusCode = 404;

    return { props: { error } };
  }
};

const Main = styled.main`
  height: 100%;
  width: 100%;
`;

const TableWrapper = styled.div`
  width: 95%;
  margin: auto;
`;

const TableContainer = styled.div`
  width: 100%;
  margin: 30px 0;
`;

const TableHeading = styled.h2`
  width: 95%;
  margin: 30px auto;
  font-size: 2.2rem;
  padding: 5px 0;
  border-bottom: 1px solid black;
`;

const SelectorWrapper = styled.div`
  width: 250px;
  float: right;
`;

const CenteredContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
`;

const ErrorBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.red200};
  height: 50px;
  padding: 10px;
  margin: 10px 0;
  font-weight: 500;
`;

const PlayerInfo = styled.div`
  font-size: 1.1rem;
  text-transform: uppercase;
  text-align: center;
`;

const PlayerName = styled.div`
  font-size: 1.6rem;
  font-weight: bold;
`;

const ImageWrapper = styled.div`
  padding: 10px;
`;

const Container = styled.div`
  width: 75%;
  padding: 1px 0 40px 0;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.grey100};

  @media screen and (max-width: 1024px) {
    width: 100%;
    padding: 2.5%;
  }
`;

const ControlWrapper = styled.div`
  margin: 3%;
  height: 25px;
`;

const DisplaySelectContainer = styled.div`
  margin: 28px auto;
  width: 95%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey500};
`;

const DisplaySelectItem = styled.div<{ active: boolean }>`
  display: inline-block;
  padding: 8px 24px;
  border: 1px solid
    ${({ theme, active }) => (active ? theme.colors.grey500 : 'transparent')};
  background-color: ${({ theme, active }) =>
    active ? theme.colors.grey100 : 'transparent'};
  border-radius: 5px 5px 0 0;
  cursor: pointer;
  position: relative;
  border-bottom: none;
  bottom: -1px;
`;

const Logo = styled.img`
  height: 150px;
  width: 150px;
`;

export default PlayerPage;
